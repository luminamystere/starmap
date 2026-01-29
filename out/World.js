//@ts-check
import { createScene } from "./components/scene.js";
import MouseControls from "./systems/MouseControls.js";
import FlyMovement from "./systems/FlyMovement.js";
import Star from "./components/Star.js";
import Collider from "./components/Collider.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { WebGLRenderer, PerspectiveCamera, Raycaster, Vector3, Color, Vector2, BufferGeometry, Line, LineBasicMaterial, CubeTextureLoader, AmbientLight, ReinhardToneMapping, SRGBColorSpace, InstancedMesh, SphereGeometry, MeshStandardMaterial } from "three";
import StarPath from "./components/StarPath.js";
import StarPanel from "./ui/StarPanel.js";
import ProjectPanel from "./ui/ProjectPanel.js";
import Faction from "./components/Faction.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { debounce } from "./utility/Async.js";
import Math2 from "./utility/Math2.js";
import Component from "./ui/Component.js";
import StarPathPanel from "./ui/StarPathPanel.js";
import Store from "./utility/Store.js";
import InputManager from "./systems/InputManager.js";
import { PanelClasses } from "./ui/Panel.js";
export default class World {
    get projectName() {
        return this._projectName;
    }
    set projectName(input) {
        this._projectName = input;
        this.updateProjectName(this._projectName);
    }
    get starpathColour() {
        return `#${this._starpathDefaultColor.getHexString()}`;
    }
    set starpathColour(input) {
        this._starpathDefaultColor = new Color(input);
    }
    constructor() {
        this.mouse = {};
        this.time = Date.now();
        this.interacted = false;
        this.TIME_DILATION = 1;
        this.SPEED_MULTIPLIER = 5;
        this.TICKRATE = 1000 / 60;
        this.SENSITIVITY = 500;
        this.isLoading = false;
        this.popup = false;
        this.raycastStarDistance = 0;
        this.raycastStarpathDistance = 0;
        this.cursorDistance = 0;
        this.projectNameElement = new Component("div")
            .addClass("project-name");
        this.defaultStarColour = new Color(0xFFFFFF);
        this.stars = [];
        this.colliders = [];
        this.starPaths = [];
        this.toMove = [];
        this.moving = [];
        this.movingLine = [];
        this.factions = [];
        this.backgrounds = [];
        this.blackBackground = new Color(0x000000);
        this.hovering = [];
        this.hoveringPath = [];
        this.playerVelocity = new Vector3();
        this.playerDirection = new Vector3();
        this.saveInternal = this.saveInternal.bind(this);
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
        const near = 0.05;
        const far = 1000;
        this._camera = new PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 0, 0);
        this._camera.rotation.order = 'YXZ';
        this._starpathDefaultColor = new Color(0xCCCCCC);
        this._projectName = "untitled project";
        document.body.appendChild(this.projectNameElement.element);
        this.updateProjectName(this.projectName);
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
        textureCube.name = "01";
        this.backgrounds.push(textureCube);
        loader.setPath('./static/textures/skybox02/');
        textureCube = loader.load(['skybox_right1.png', 'skybox_left2.png', 'skybox_top3.png', 'skybox_bottom4.png', 'skybox_front5.png', 'skybox_back6.png']);
        textureCube.name = "02";
        this.backgrounds.push(textureCube);
        loader.setPath('./static/textures/skybox03/');
        textureCube = loader.load(['skybox_right1.png', 'skybox_left2.png', 'skybox_top3.png', 'skybox_bottom4.png', 'skybox_front5.png', 'skybox_back6.png']);
        textureCube.name = "03";
        this.backgrounds.push(textureCube);
        this.backgroundName = "03";
        this.chooseBackground(this.backgroundName);
        this.starMesh = new InstancedMesh(new SphereGeometry(0.2, 12, 12), new MeshStandardMaterial({ emissive: new Color(0x555555), emissiveIntensity: 1, toneMapped: false }), 1024);
        this.starMesh.count = 0;
        this.starMesh.setColorAt(0, this.defaultStarColour);
        this._scene.add(this.starMesh);
        this.cameraControls = new MouseControls(this);
        this.cameraControls.setCamera(this._camera);
        this._Initialise();
    }
    _Initialise() {
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);
        this._OnWindowResize();
        InputManager.addListener("down", () => Store.keyCursorCloser, () => {
            if (this.moving.length == 0) {
                return false;
            }
            else {
                this.cursorDistance += 0.5;
                this.cursorDistance = Math2.clamp(5, 10000, this.cursorDistance);
                return true;
            }
        });
        InputManager.addListener("down", () => Store.keyCursorFurther, () => {
            if (this.moving.length == 0) {
                return false;
            }
            else {
                this.cursorDistance -= 0.5;
                this.cursorDistance = Math2.clamp(5, 10000, this.cursorDistance);
                return true;
            }
        });
        InputManager.addListener("down", () => Store.keyInputSpeedUp, () => {
            if (this.projectPanel || this.starPanel || this.starpathPanel) {
                return false;
            }
            this.SPEED_MULTIPLIER += 1;
            this.SPEED_MULTIPLIER = Math2.clamp(1, 10, this.SPEED_MULTIPLIER);
            this.movementControls?.changeSpeed(this.SPEED_MULTIPLIER);
            this.updateProjectName(this._projectName);
            return true;
        });
        InputManager.addListener("down", () => Store.keyInputSpeedDown, () => {
            if (this.projectPanel || this.starPanel || this.starpathPanel) {
                return false;
            }
            this.SPEED_MULTIPLIER -= 1;
            this.SPEED_MULTIPLIER = Math2.clamp(1, 10, this.SPEED_MULTIPLIER);
            this.movementControls?.changeSpeed(this.SPEED_MULTIPLIER);
            this.updateProjectName(this._projectName);
            return true;
        });
        document.addEventListener("mousedown", () => {
            if (!(InputManager.getHoveredElement()?.closest(`.${PanelClasses.Main}`)) && (this.projectPanel || this.starPanel || this.starpathPanel)) {
                const hundredMsAgo = Date.now() - 100;
                if ((this.projectPanel?.openedAt ?? 0) < hundredMsAgo) {
                    this.projectPanel?.remove();
                }
                else if ((this.starPanel?.openedAt ?? 0) < hundredMsAgo) {
                    this.starPanel?.remove();
                }
                else if ((this.starpathPanel?.openedAt ?? 0) < hundredMsAgo) {
                    this.starpathPanel?.remove();
                }
            }
        });
        InputManager.addListener("up", () => Store.keyClosePanel, input => {
            if ((this.projectPanel || this.starPanel || this.starpathPanel) && this.popup == false) {
                if (this.projectPanel) {
                    this.projectPanel.remove();
                    return true;
                }
                else if (this.starPanel) {
                    this.starPanel.remove();
                    return true;
                }
                else if (this.starpathPanel) {
                    this.starpathPanel.remove();
                    return true;
                }
                else {
                    return false;
                }
            }
            return false;
        });
        InputManager.addListener("down", () => Store.keyMoveStar, () => {
            if (this.starPanel || this.starpathPanel || this.projectPanel) {
                return false;
            }
            this.moveStar();
            return true;
        });
        InputManager.addListener("up", () => Store.keyMoveStar, () => {
            if (this.moving.length > 0) {
                this.saveLocalStorage();
            }
            this.moving = [];
            this.toMove = [];
            delete this.savedCursorPosition;
            return true;
        });
        InputManager.addListener("down", () => Store.keyCreateStarpath, () => {
            if (this.starPanel || this.starpathPanel || this.projectPanel) {
                return false;
            }
            const star = this.raycastForStar();
            if (star) {
                this.cursorDistance = this.raycastStarDistance;
                this.starpathStart = star;
                const cursorPos = this.getCursorPosition(this.cursorDistance);
                this.linePoints = [new Vector3(star.position.x, star.position.y, star.position.z),
                    new Vector3(cursorPos.x, cursorPos.y, cursorPos.z)];
                this.lineGeometry = new BufferGeometry().setFromPoints(this.linePoints);
                this.lineObject = new Line(this.lineGeometry, new LineBasicMaterial({ color: 0xFFFFFF, linewidth: 1 }));
                this._scene.add(this.lineObject);
                return true;
            }
            else {
                return false;
            }
        });
        InputManager.addListener("up", () => Store.keyCreateStarpath, () => {
            this.createLine();
            delete this.linePoints;
            if (this.lineObject) {
                this.lineObject.geometry.dispose();
                this._scene.remove(this.lineObject);
            }
            this.movingLine = [];
            return true;
        });
        InputManager.addListener("down", () => Store.keyOpenStarPanel, () => {
            if (this.starPanel || this.starpathPanel || this.projectPanel) {
                return false;
            }
            const star = this.raycastForStar();
            if (star) {
                this.interacted = true;
                this.showStarPanel(star);
                return true;
            }
            return false;
        });
        InputManager.addListener("down", () => Store.keyOpenStarpathPanel, () => {
            if (this.starPanel || this.starpathPanel || this.projectPanel) {
                return false;
            }
            const starpath = this.raycastForStarpath();
            if (starpath) {
                this.interacted = true;
                this.showStarpathPanel(starpath);
                this.saveLocalStorage();
                return true;
            }
            return false;
        });
        InputManager.addListener("down", () => Store.keyCreateStar, () => {
            if (this.starPanel || this.starpathPanel || this.projectPanel) {
                return false;
            }
            this.spawnOrb();
            return true;
        });
        document.body.addEventListener("contextmenu", event => {
            if (this.interacted) {
                event.preventDefault();
                this.interacted = false;
            }
        });
        document.addEventListener("pointerlockchange", () => {
            setTimeout(() => {
                if (!document.pointerLockElement && !this.projectPanel && !this.starPanel && !this.starpathPanel) {
                    this.showProjectPanel();
                }
            }, 300);
        });
        document.addEventListener("wheel", event => {
            if (event.ctrlKey)
                event.preventDefault();
        }, { passive: false });
        let light = new AmbientLight(0xFFFFFF);
        this._scene.add(light);
        this.movementControls = new FlyMovement(this, this.SPEED_MULTIPLIER);
        const renderScene = new RenderPass(this._scene, this._camera);
        const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.6, 0.1, 0.3);
        bloomPass.renderToScreen = true;
        const pixelRatio = this._threejs.getPixelRatio();
        this.antialiasPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
        this.antialiasPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
        this.bloomRenderer.addPass(renderScene);
        this.bloomRenderer.addPass(bloomPass);
        this.bloomRenderer.addPass(this.antialiasPass);
        this._scene.add(this.cameraControls.getObject());
        this.loadLocalStorage();
        this._Update();
        this.showProjectPanel();
    }
    resetWorld() {
        console.log("ouchies!");
        for (let i = this.stars.length - 1; i >= 0; i--) {
            this.stars[i].delete();
        }
        this.starMesh.count = 0;
        this.factions = [];
        this.projectName = "untitled project";
        this.cameraControls = new MouseControls(this);
        this.cameraControls.setCamera(this._camera);
        this.cameraControls.getObject().position.set(0, 0, 0);
        this._Update();
    }
    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        this.bloomRenderer.setSize(window.innerWidth, window.innerHeight);
        this._labelRender.setSize(window.innerWidth, window.innerHeight);
        const pixelRatio = this._threejs.getPixelRatio();
        this.antialiasPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
        this.antialiasPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    }
    serialiseJSON() {
        return JSON.stringify({
            starPaths: this.starPaths.map(starPath => ({
                name: starPath.starpathName,
                description: starPath.description,
                star1: this.stars.indexOf(starPath.star1),
                star2: this.stars.indexOf(starPath.star2),
                colour: starPath.starpathColour,
            })),
            stars: this.stars.map(star => ({
                name: star.name,
                description: star.description,
                faction: this.factions.indexOf(star.faction),
                factionSize: star.factionSize,
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
                cameraLocation: [this._camera.getWorldPosition(new Vector3).x || 0,
                    this._camera.getWorldPosition(new Vector3).y || 0,
                    this._camera.getWorldPosition(new Vector3).z || 0],
                cameraDirection: this.cameraControls.serialise(),
                projectName: this.projectName,
            }
        });
    }
    saveLocalStorage() {
        if (this.isLoading) {
            return;
        }
        debounce(1000, this.saveInternal);
    }
    saveInternal() {
        console.log("saving local storage");
        localStorage.setItem("save", this.serialiseJSON());
    }
    loadLocalStorage() {
        console.log("loading local storage");
        const localStorageDataString = localStorage.getItem("save") ?? '{"starPaths": [], "stars": [], "factions": [], "world": []}';
        this.deserialiseJSON(localStorageDataString);
    }
    deserialiseJSON(input) {
        this.resetWorld();
        const saved = JSON.parse(input);
        this.isLoading = true;
        this.factions = saved.factions.map(saved => new Faction(saved.name, saved.description, new Color(saved.colour)));
        for (const savedStar of saved.stars) {
            const star = new Star(savedStar.name, savedStar.description, new Color(savedStar.colour), new Vector3(savedStar.position[0], savedStar.position[1], savedStar.position[2]), this._scene, this);
            this.stars.push(star);
            this.colliders.push(star.collider);
        }
        for (const savedStarPath of saved.starPaths) {
            const star1 = this.stars[savedStarPath.star1];
            const star2 = this.stars[savedStarPath.star2];
            if (star1 && star2) {
                const starPath = new StarPath(savedStarPath.name || "", savedStarPath.description || "Add text here!", star1, star2, new Color(savedStarPath.colour) || this.defaultStarColour, this._scene, this);
                this.starPaths.push(starPath);
            }
        }
        if (saved.world) {
            if (saved.world.starpathColour) {
                this._starpathDefaultColor = new Color(saved.world.starpathColour);
                for (const starpath of this.starPaths) {
                    starpath.updateColour();
                }
            }
            else {
                this._starpathDefaultColor = new Color(0xCCCCCC);
            }
            if (saved.world.background) {
                this.backgroundName = saved.world.background || "None";
                this.chooseBackground(this.backgroundName);
            }
            if (saved.world.cameraLocation) {
                const savedLocation = new Vector3(saved.world.cameraLocation[0] || 0, saved.world.cameraLocation[1] || 0, saved.world.cameraLocation[2] || 0);
                if (this.cameraControls && this.movementControls) {
                    this.cameraControls.getObject().position.add(savedLocation);
                }
            }
            if (saved.world.cameraDirection) {
                this.cameraControls.deserialise(saved.world.cameraDirection);
            }
            if (saved.world.projectName) {
                this._projectName = saved.world.projectName;
                this.updateProjectName(saved.world.projectName);
            }
        }
        this.isLoading = false;
        if (this.projectPanel) {
            this.projectPanel.refreshPanel();
        }
        this._Update();
    }
    updateProjectName(name) {
        const speedText = " - " + this.SPEED_MULTIPLIER.toString() + "x";
        const elementText = name + speedText;
        const pageTitle = name + " - Starmap";
        this.projectNameElement.setText(elementText);
        document.title = pageTitle;
    }
    spawnOrb() {
        if (this.starMesh.count === 1024) {
            return;
        }
        const star = new Star("", "Add text here!", this.defaultStarColour, this.getCursorPosition() || new Vector3(0, 0, 0), this._scene, this);
        this.stars.push(star);
        this.colliders.push(star.collider);
    }
    raycastForStar() {
        this._raycaster.setFromCamera(new Vector2(0, 0), this._camera);
        const intersects = this._raycaster.intersectObjects(this.colliders, true);
        if (intersects.length == 0) {
            this.raycastStarDistance = 0;
            return;
        }
        else {
            const collider = intersects[0]?.object;
            if (!(collider instanceof Collider)) {
                return;
            }
            this.raycastStarDistance = intersects[0].distance;
            return collider.relatedStar;
        }
    }
    raycastForStarpath() {
        this._raycaster.setFromCamera(new Vector2(0, 0), this._camera);
        const intersects = this._raycaster.intersectObjects(this.starPaths, true);
        if (intersects.length == 0) {
            this.raycastStarpathDistance = 0;
            return;
        }
        else {
            for (const object of intersects) {
                if (object.object instanceof StarPath) {
                    this.raycastStarpathDistance = object.distance;
                    return object.object;
                }
            }
        }
    }
    showProjectPanel() {
        if (this.projectPanel) {
            this.projectPanel.remove();
            delete this.projectPanel;
        }
        else {
            this.projectPanel = new ProjectPanel(this)
                .addEventListener("closePanel", () => {
                this.cameraControls.lockMouse();
                this.saveLocalStorage();
                delete this.projectPanel;
            });
            document.body.append(this.projectPanel.element);
            document.exitPointerLock();
        }
    }
    showStarPanel(star) {
        if (star == undefined) {
            return;
        }
        this.starPanel = new StarPanel(star)
            .addEventListener("closePanel", () => {
            this.cameraControls.lockMouse();
            this.saveLocalStorage();
            delete this.starPanel;
        });
        document.body.append(this.starPanel.element);
        document.exitPointerLock();
    }
    showStarpathPanel(starpath) {
        if (starpath == undefined) {
            return;
        }
        this.starpathPanel = new StarPathPanel(starpath)
            .addEventListener("closePanel", () => {
            this.cameraControls.lockMouse();
            this.saveLocalStorage();
            delete this.starpathPanel;
        });
        document.body.append(this.starpathPanel.element);
        document.exitPointerLock();
    }
    getCursorPosition(distance) {
        return this._camera.getWorldPosition(new Vector3())
            .add(this._camera.getWorldDirection(new Vector3())
            .multiplyScalar(distance || 5));
    }
    moveStar() {
        if (this.moving.length == 1) {
            return;
        }
        if (!this.savedCursorPosition) {
            this.cursorDistance = this.raycastStarDistance;
            this.savedCursorPosition = this.getCursorPosition(this.cursorDistance);
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
    createLine() {
        const star1 = this.starpathStart;
        delete this.starpathStart;
        const star2 = this.raycastForStar();
        if (!star2 || !star1 || star1 == star2) {
            return;
        }
        this.starPaths.push(new StarPath("", "Add text here!", star1, star2, this._starpathDefaultColor, this._scene, this));
        this.saveLocalStorage();
    }
    chooseBackground(background) {
        if (background == "None") {
            this._scene.background = null;
            delete this.currentBackground;
        }
        else {
            const chosenBackground = this.backgrounds.find((element) => element.name == background);
            if (chosenBackground == null) {
                return;
            }
            this.currentBackground = chosenBackground;
            this._scene.background = this.currentBackground;
        }
        this.backgroundName = background;
    }
    _Update() {
        const elapsed = Date.now() - this.time;
        this.time = Date.now();
        const delta = elapsed / this.TICKRATE;
        if (this.movementControls) {
            this.movementControls.update(delta);
            this.cameraControls.getObject().position.add(this.movementControls.getMovementVector(delta));
        }
        for (const star of this.stars) {
            star.updateLabelScale(this._camera.getWorldPosition(new Vector3));
        }
        if (this.starPanel || this.projectPanel) {
            return;
        }
        const star = this.raycastForStar();
        const starpath = this.raycastForStarpath();
        if (star !== undefined) {
            star.hoverStar();
            this.hovering.push(star);
            if (this.hovering.length > 0 && star !== this.hovering[0]) {
                this.hovering[0].unHoverStar();
                this.hovering.splice(0, 1);
            }
        }
        else if (this.hovering.length > 0) {
            for (const star of this.hovering) {
                star.unHoverStar();
            }
            this.hovering = [];
        }
        if (starpath !== undefined) {
            starpath.hoverStarpath();
            this.hoveringPath.push(starpath);
            if (this.hoveringPath.length > 0 && starpath !== this.hoveringPath[0]) {
                this.hoveringPath[0].unhoverStarpath();
                this.hoveringPath.splice(0, 1);
            }
        }
        else if (this.hoveringPath.length > 0) {
            for (const starpath of this.hoveringPath) {
                starpath.unhoverStarpath();
            }
            this.hoveringPath = [];
        }
        if (this.toMove.length == 1 && this.savedCursorPosition) {
            const movedLength = new Vector3().subVectors(this.savedCursorPosition, this.getCursorPosition(this.cursorDistance)).length();
            if (movedLength > 1) {
                this.moving.push(this.toMove[0]);
                this.toMove = [];
                delete this.savedCursorPosition;
            }
        }
        //left click moving star
        if (this.moving.length == 1) {
            const cursorPos = this.getCursorPosition(this.cursorDistance);
            this.moving[0].position.set(cursorPos.x, cursorPos.y, cursorPos.z);
            this.moving[0].updatePosition();
            for (const i in this.movingLine) {
                this.movingLine[i].updatePoint(cursorPos, this.moving[0]);
            }
        }
        //right click dragging lines
        if (this.lineObject && this.linePoints) {
            this.linePoints[1] = this.getCursorPosition(this.cursorDistance);
            this.lineObject.geometry.setFromPoints(this.linePoints);
            this.lineObject.geometry.computeBoundingSphere();
        }
    }
    render() {
        this._Update();
        this._threejs.clear();
        this.bloomRenderer.render();
        this._labelRender.render(this._scene, this._camera);
    }
}
