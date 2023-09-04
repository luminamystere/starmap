//@ts-check
// import * as THREE from "three";
import { createScene } from "./components/scene.js";
import MouseControls from "./systems/MouseControls.js"
import FlyMovement from "./systems/FlyMovement.js";
import Star from "./components/Star.js";
import Collider from "./components/Collider.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { WebGLRenderer, PerspectiveCamera, Raycaster, Scene, Object3D, Vector3, Color, Vector2, BufferGeometry, Line, LineBasicMaterial, CubeTextureLoader, CubeTexture, AmbientLight, ReinhardToneMapping, SRGBColorSpace } from "three";
import StarPath from "./components/StarPath.js";
import StarPanel from "./ui/StarPanel.js";
import ProjectPanel from "./ui/ProjectPanel.js";
import Faction from "./components/Faction.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

interface SavedData {
    starPaths: {
        star1: number;
        star2: number;
    }[];
    stars: {
        name: string;
        faction: number;
        colour: string;
        position: [number, number, number];
    }[]
    factions: {
        name: string;
        description: string;
        colour: string;
    }[];
    world: {
        starpathColour: string;
        background: string;
    };
}

export default class World {

    public keyboard: Record<string, number> = {};
    public mouse: Record<string, number> = {};
    public _threejs: WebGLRenderer;
    public bloomRenderer: EffectComposer;
    public antialiasPass: ShaderPass;
    public _labelRender: CSS2DRenderer;
    public _camera: PerspectiveCamera;
    public _raycaster: Raycaster;

    public _scene: Scene;
    public cameraControls?: MouseControls;
    public movementControls?: FlyMovement;
    public time = Date.now();
    public TIME_DILATION = 1;
    public SPEED_HORIZONTAL = 2;
    public SPEED_VERTICAL = 0.2;
    public TICKRATE = 1000 / 60;
    public SENSITIVITY = 500;
    public savedCursorPosition?: Vector3;

    public stars: Star[] = [];
    public colliders: Object3D[] = [];
    public starPaths: StarPath[] = [];
    public toMove: Star[] = [];
    public moving: Star[] = [];
    public movingLine: StarPath[] = [];
    public interacting: Star[] = [];
    public factions: Faction[] = [];

    public backgrounds: CubeTexture[] = [];
    public currentBackground?: CubeTexture;
    public backgroundName?: string;
    public blackBackground: Color = new Color(0x000000);

    public hovering: Star[] = [];

    public linePoints: Vector3[] = [];
    public lineGeometry?: BufferGeometry;
    public lineObject?: Line;

    public _starpathDefaultColor: Color;
    public get starpathColour () {
        return `#${this._starpathDefaultColor.getHexString()}`
    }
    public set starpathColour (input: `#${string}`) {
        this._starpathDefaultColor = new Color(input);
        for (const starpaths of this.starPaths) {
            starpaths.updateColour();
        }
    }

    public playerVelocity = new Vector3();
    public playerDirection = new Vector3();
    public playerPosition = new Vector3();

    public starPanel?: StarPanel;
    public projectPanel?: ProjectPanel;

    public constructor () {

        this._threejs = new WebGLRenderer();
        this._threejs.shadowMap.enabled = false;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        this._threejs.autoClear = false;
        this._threejs.toneMapping = ReinhardToneMapping;
        this._threejs.outputColorSpace = SRGBColorSpace;
        this._threejs.toneMappingExposure = Math.pow(0.7, 0.3);
        document.body.appendChild(this._threejs.domElement);

        this._labelRender = new CSS2DRenderer();
        this._labelRender.setSize(window.innerWidth, window.innerHeight);
        this._labelRender.domElement.style.position = 'absolute';
        this._labelRender.domElement.style.top = '0px';
        document.body.appendChild(this._labelRender.domElement);

        const fov = 90;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000;
        this._camera = new PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 1, 0);
        this._camera.rotation.order = 'YXZ';
        // this._camera.layers.enableAll();
        this._starpathDefaultColor = new Color(0xCCCCCC);

        this._raycaster = new Raycaster();
        this._raycaster.camera = this._camera;

        this._scene = createScene();

        //postprocessing
        this.bloomRenderer = new EffectComposer(this._threejs);
        this.bloomRenderer.setSize(window.innerWidth, window.innerHeight);
        this.bloomRenderer.renderToScreen = true;

        this.antialiasPass = new ShaderPass(FXAAShader);

        const loader = new CubeTextureLoader();

        loader.setPath('./static/textures/skybox01/');
        let textureCube = loader.load(['skybox_right1.png', 'skybox_left2.png', 'skybox_top3.png', 'skybox_bottom4.png', 'skybox_front5.png', 'skybox_back6.png']);
        textureCube.name = "01"
        this.backgrounds.push(textureCube);

        loader.setPath('./static/textures/skybox02/');
        textureCube = loader.load(['skybox_right1.png', 'skybox_left2.png', 'skybox_top3.png', 'skybox_bottom4.png', 'skybox_front5.png', 'skybox_back6.png']);
        textureCube.name = "02"
        this.backgrounds.push(textureCube);

        loader.setPath('./static/textures/skybox03/');
        textureCube = loader.load(['skybox_right1.png', 'skybox_left2.png', 'skybox_top3.png', 'skybox_bottom4.png', 'skybox_front5.png', 'skybox_back6.png']);
        textureCube.name = "03"
        this.backgrounds.push(textureCube);

        this.currentBackground = this.backgrounds[1];

        this._Initialise();
    }

    public _Initialise () {


        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);
        this._OnWindowResize();

        document.body.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.code === "Escape") {
                document.exitPointerLock();
            }

            this.keyboard[event.code] ??= Date.now();
        });
        document.body.addEventListener("keyup", event => {
            delete this.keyboard[event.code];
        })
        document.body.addEventListener("mousedown", event => {
            this.mouse[event.button] ??= Date.now();
            if (this.starPanel) {
                return;
            }
            if (this.mouse[0]) {
                this.moveStar();
            }
            else if (this.mouse[2]) {
                this.showDetails();
            }
        });
        let lastStarPanelShown = 0;
        document.body.addEventListener("mouseup", event => {
            if (this.mouse[0]) {
                this.moving = [];
                this.toMove = [];
                delete this.savedCursorPosition;
                this.saveLocalStorage();
            } else if (this.mouse[1]) {
                const starpath = this.raycastForStarpath();
                if (starpath instanceof StarPath) {
                    starpath.deleteStarPath();
                }
                this.saveLocalStorage();

            } else if (this.mouse[2]) {
                this.createLine();
                if (this.starPanel || this.projectPanel) {
                    return;
                }
                if (this.raycastForStar() == this.interacting[0]) {
                    this.showStarPanel(this.interacting[0]);
                    lastStarPanelShown = Date.now();
                }
                this.interacting = [];
                this.linePoints = [];
                if (this.lineObject) {
                    this.lineObject.geometry.dispose();
                    this._scene.remove(this.lineObject);
                }
                this.movingLine = [];
                this.saveLocalStorage();
            }
            delete this.mouse[event.button];
        });
        document.body.addEventListener("contextmenu", event => {
            if (Date.now() - lastStarPanelShown < 10) {
                event.preventDefault();
            }
        });
        document.addEventListener("pointerlockchange", () => {
            setTimeout(() => {
                if (!document.pointerLockElement && !this.projectPanel && !this.starPanel) {
                    this.showProjectPanel();
                }
            }, 100);
        });

        let light = new AmbientLight(0xFFFFFF);
        this._scene.add(light);

        this.movementControls = new FlyMovement(this);

        const renderScene = new RenderPass(this._scene, this._camera);
        const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.4, 0.2, 0.3);
        bloomPass.renderToScreen = true;


        const pixelRatio = this._threejs.getPixelRatio();
        this.antialiasPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
        this.antialiasPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);



        this.bloomRenderer.addPass(renderScene);
        this.bloomRenderer.addPass(bloomPass);
        this.bloomRenderer.addPass(this.antialiasPass);

        this.cameraControls = new MouseControls(this);
        this.cameraControls.setCamera(this._camera);
        this._scene.add(this.cameraControls.getObject());
        this.loadLocalStorage();
    }

    _OnWindowResize () {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        this.bloomRenderer.setSize(window.innerWidth, window.innerHeight);
        this._labelRender.setSize(window.innerWidth, window.innerHeight);

        const pixelRatio = this._threejs.getPixelRatio();
        this.antialiasPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
        this.antialiasPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    }

    public serialiseJSON () {
        return JSON.stringify({
            starPaths: this.starPaths.map(starPath => ({
                star1: this.stars.indexOf(starPath.star1),
                star2: this.stars.indexOf(starPath.star2),
            })),
            stars: this.stars.map(star => ({
                name: star.name,
                faction: this.factions.indexOf(star.faction!),
                colour: star.starColour,
                position: [star.position.x, star.position.y, star.position.z],
            })),
            factions: this.factions.map(faction => ({
                name: faction.name,
                description: faction.description,
                colour: faction.colour,
            })),
            world: {
                starpathColour: this.starpathColour,
                background: this.backgroundName || "None",
            }
        } satisfies SavedData);
    }

    public saveLocalStorage () {
        console.log("saving local storage");
        localStorage.setItem("save", this.serialiseJSON());
    }

    public loadLocalStorage () {
        console.log("loading local storage");
        const saved: SavedData = JSON.parse(localStorage.getItem("save") ?? '{"starPaths": [], "stars": [], "factions": [], "world": []}');
        console.log(saved);
        this.factions = saved.factions.map(saved => new Faction(saved.name, saved.description, new Color(saved.colour))) as Faction[];
        for (const savedStar of saved.stars) {
            const star = new Star(savedStar.name,
                new Color(savedStar.colour),
                new Vector3(savedStar.position[0], savedStar.position[1], savedStar.position[2]),
                this._scene, this);
            this.stars.push(star);
            this.colliders.push(star.collider);
            const faction = this.factions[savedStar.faction];
            if (faction) {
                star.updateFaction(faction.name);
            }
        }
        for (const savedStarPath of saved.starPaths) {
            const star1 = this.stars[savedStarPath.star1];
            const star2 = this.stars[savedStarPath.star2];
            if (star1 && star2) {
                const starPath = new StarPath(star1, star2, this._scene, this);
                this.starPaths.push(starPath);
            }
        }
        if (saved.world) {
            console.log("saved.world exists");
            if (saved.world.starpathColour) {
                this._starpathDefaultColor = new Color(saved.world.starpathColour);
                for (const starpath of this.starPaths) {
                    starpath.updateColour();
                }
            } else {
                this._starpathDefaultColor = new Color(0xCCCCCC)
            }
            this.backgroundName = saved.world.background || "None";
            this.chooseBackground(this.backgroundName);
        }

    }

    public spawnOrb () {
        const star = new Star("", new Color(0xAA0000),
            this.getCursorPosition() || new Vector3(0, 0, 0),
            this._scene, this);
        this.stars.push(star);
        this.colliders.push(star.collider);
    }

    public raycastForStar () {
        this._raycaster.setFromCamera(new Vector2(0, 0), this._camera);
        const intersects = this._raycaster.intersectObjects(this.colliders, true);
        if (intersects.length == 0) {
            return;
        } else {
            const collider = intersects[0]?.object as Collider;
            if (!(collider instanceof Collider)) {
                return;
            }
            return collider.relatedStar;
        }
    }

    public raycastForStarpath () {
        console.log("raycasting!");
        this._raycaster.setFromCamera(new Vector2(0, 0), this._camera);
        const intersects = this._raycaster.intersectObjects(this.starPaths, true);
        console.log("starpaths array", this.starPaths);
        console.log("intersects: ", intersects);
        if (intersects.length == 0) {
            return;
        } else {
            const starPath = intersects[0]?.object as StarPath;
            if (!(starPath instanceof StarPath)) {
                return;
            }
            return starPath;
        }
    }

    public showDetails () {
        if (this.interacting.length == 1) {
            return;
        }
        const star = this.raycastForStar();
        if (star == undefined) {
            this.spawnOrb();
            return;
        } else {
            this.interacting.push(star);
            this.linePoints.push(new Vector3(star.position.x, star.position.y, star.position.z));
            const cursorPos = this.getCursorPosition();
            this.linePoints.push(new Vector3(cursorPos.x, cursorPos.y, cursorPos.z));
            this.lineGeometry = new BufferGeometry().setFromPoints(this.linePoints);
            this.lineObject = new Line(this.lineGeometry, new LineBasicMaterial({ color: 0xFFFFFF, linewidth: 1 }));
            this._scene.add(this.lineObject);
        }

    }

    public showProjectPanel () {
        if (this.projectPanel) {
            this.projectPanel.remove();
            delete this.projectPanel;
            console.log("deleting project panel");
        } else {
            this.projectPanel = new ProjectPanel(this)
                .addEventListener("closePanel", () => {
                    this.cameraControls?.lockMouse();
                    delete this.projectPanel;
                });
            document.body.append(this.projectPanel.element);
            document.exitPointerLock();
            console.log("showing project panel");
        }
    }

    public showStarPanel (star: Star) {
        if (star == undefined) {
            console.log("no star yet");
            return;
        }
        this.starPanel = new StarPanel(star)
            .addEventListener("closePanel", () => {
                this.cameraControls?.lockMouse();
                delete this.starPanel;
            });
        document.body.append(this.starPanel.element);
        document.exitPointerLock();
    }

    private getCursorPosition () {
        return this._camera.getWorldPosition(new Vector3())
            .add(this._camera.getWorldDirection(new Vector3())
                .multiplyScalar(5));
    }

    public moveStar () {
        console.log("move star is executing");
        if (this.moving.length == 1) {
            return;
        }
        if (!this.savedCursorPosition) {
            this.savedCursorPosition = this.getCursorPosition();
        }
        const star = this.raycastForStar();
        if (star == undefined) {
            return;
        }
        this.toMove.push(star);
        if (star.starPaths.length > 0) {
            for (const i in star.starPaths) {
                this.movingLine.push(star.starPaths[i]);
            }
        }
    }

    public createLine () {
        const star = this.raycastForStar();
        if (star == undefined || this.interacting.length == 0) {
            return;
        }
        const star1 = this.interacting[0];
        const star2 = star;
        if (star1 == star2) {
            return;
        }
        this.starPaths.push(new StarPath(star1, star2, this._scene, this));
    }

    public chooseBackground (background: string) {
        console.log(background);
        if (background == "None") {
            this._scene.background = null;
            delete this.currentBackground;
        } else {
            const chosenBackground = this.backgrounds.find((element) => element.name == background);
            if (chosenBackground == null) {
                return;
            }
            this.currentBackground = chosenBackground;
            this._scene.background = this.currentBackground;
        }
        this.backgroundName = background;
    }

    public _Update () {

        if (!this.movementControls) {
            return;
        }

        const elapsed = Date.now() - this.time;
        this.time = Date.now();
        const delta = elapsed / this.TICKRATE;

        if (this.starPanel || this.projectPanel) {
            return;
        }

        this.movementControls?.update(delta);
        this.cameraControls?.getObject().position.add(this.movementControls.updatePlayer(delta))

        const star = this.raycastForStar();
        if (star !== undefined) {
            star.hoverStar();
            this.hovering.push(star);
        } else if (this.hovering.length > 0) {
            for (const star of this.hovering) {
                star.unHoverStar();
            }
            this.hovering = [];
        }

        for (const star of this.stars) {
            star.updateLabelScale(this._camera.getWorldPosition(new Vector3));
        }

        if (this.toMove.length == 1 && this.savedCursorPosition) {
            const movedLength = new Vector3().subVectors(this.savedCursorPosition, this.getCursorPosition()).length();
            if (movedLength > 1) {
                this.moving.push(this.toMove[0]);
                this.toMove = [];
                delete this.savedCursorPosition;
            }
        }

        //left click moving star
        if (this.mouse[0] && this.moving.length == 1) {
            const cursorPos = this.getCursorPosition();
            this.moving[0].position.set(cursorPos.x, cursorPos.y, cursorPos.z)
            this.moving[0].updatePosition();
            for (const i in this.movingLine) {
                this.movingLine[i].updatePoint(cursorPos, this.moving[0]);
            }

        }
        //right click dragging lines
        if (this.mouse[2] && this.interacting.length == 1) {
            this.linePoints[1] = this.getCursorPosition();
            this.lineObject?.geometry.setFromPoints(this.linePoints);

        }
    }

    public render () {
        this._Update();
        this._threejs.clear();

        this.bloomRenderer.render();
        this._labelRender.render(this._scene, this._camera);

    }
}