//@ts-check
// import * as THREE from "three";
import { createScene } from "./components/scene.js";
import MouseControls from "./systems/MouseControls.js"
import Math2 from "./utility/Math2.js";
import FlyMovement from "./systems/FlyMovement.js";
import Star from "./components/Star.js";
import Collider from "./components/Collider.js";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js"
import { WebGLRenderer, PerspectiveCamera, Raycaster, Scene, Object3D, Vector3, PCFSoftShadowMap, DirectionalLight, BoxGeometry, Mesh, MeshBasicMaterial, Color, Vector2, BufferGeometry, Line, LineBasicMaterial } from "three";
import StarPath from "./components/StarPath.js";

export default class World {

    public keyboard: Record<string, number> = {};
    public mouse: Record<string, number> = {};
    public _threejs: WebGLRenderer;
    public _labelRender: CSS3DRenderer;
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

    public stars: Star[] = [];
    public colliders: Object3D[] = [];
    public starPaths: StarPath[] = [];
    public moving: Star[] = [];
    public movingLine: StarPath[] = [];
    public interacting: Star[] = [];

    public linePoints: Vector3[] = [];
    public lineGeometry?: BufferGeometry;
    public lineObject?: Line;

    public playerVelocity = new Vector3();
    public playerDirection = new Vector3();
    public playerPosition = new Vector3();

    public constructor () {

        this._threejs = new WebGLRenderer();
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._threejs.domElement);

        this._labelRender = new CSS3DRenderer();
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

        //this._placeRaycaster = new Raycaster(this._camera.position, new Vector3(0, 0, 0), 0, 10);
        this._raycaster = new Raycaster();
        this._raycaster.camera = this._camera;

        this._scene = createScene();
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
            this.keyboard[event.key] ??= Date.now();
        });
        document.body.addEventListener("keyup", event => {
            delete this.keyboard[event.key];
        })
        document.body.addEventListener("mousedown", event => {
            this.mouse[event.button] ??= Date.now();
            if (this.mouse[0]) {
                this.moveStar();
            }
            else if (this.mouse[2]) {
                this.showDetails();
            }
        });
        document.body.addEventListener("mouseup", event => {
            if (this.mouse[0]) {
                this.moving = [];
            } else if (this.mouse[2]) {
                this.createLine();
                this.showStarPanel(this.interacting[0]);
                this.interacting = [];
                this.linePoints = [];
                if (this.lineObject) {
                    this.lineObject.geometry.dispose();
                    this._scene.remove(this.lineObject);
                }
                this.movingLine = [];
            }
            delete this.mouse[event.button];
        });

        let light = new DirectionalLight(0xFFFFFF);
        light.position.set(100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.01;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 500;
        light.shadow.camera.left = 200;
        light.shadow.camera.right = -200;
        light.shadow.camera.top = 200;
        light.shadow.camera.bottom = -200;
        this._scene.add(light);

        const floor = new BoxGeometry(1, 1, 1);
        const ground = new Mesh(floor, new MeshBasicMaterial({ color: 0xAAAAAA }));
        ground.position.set(0, 0, -2);
        this._scene.add(ground);

        this.movementControls = new FlyMovement(this);

        this.cameraControls = new MouseControls(this);
        this.cameraControls.setCamera(this._camera);
        this._scene.add(this.cameraControls.getObject());
    }

    _OnWindowResize () {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        this._labelRender.setSize(window.innerWidth, window.innerHeight);
    }

    private lastRender = Date.now();

    public spawnOrb () {
        const star = new Star(`star number ${this.stars.length}`, new Color(0xAA0000),
            this.getCursorPosition() || new Vector3(0, 0, 0),
            this.stars.length.toString(),
            this._scene);
        this.stars.push(star);
        this.colliders.push(star.collider);
    }

    public showDetails () {
        if (this.interacting.length == 1) {
            return;
        }
        this._raycaster.setFromCamera(new Vector2(0, 0), this._camera);
        const intersects = this._raycaster.intersectObjects(this.colliders, true);
        if (intersects.length == 0) {
            this.spawnOrb();
            console.log("spawning orb");
            return;
        }
        const collider = intersects[0]?.object as Collider;
        if (!(collider instanceof Collider)) {
            return;
        }
        this.interacting.push(collider.relatedStar);
        this.linePoints.push(new Vector3(collider.relatedStar.position.x, collider.relatedStar.position.y, collider.relatedStar.position.z));
        const cursorPos = this.getCursorPosition();
        this.linePoints.push(new Vector3(cursorPos.x, cursorPos.y, cursorPos.z));
        this.lineGeometry = new BufferGeometry().setFromPoints(this.linePoints);
        this.lineObject = new Line(this.lineGeometry, new LineBasicMaterial({ color: 0xFFFFFF, linewidth: 1 }));
        this._scene.add(this.lineObject);
        // console.log(collider.relatedStar.position.x, collider.relatedStar.position.y, collider.relatedStar.position.z);

    }

    public showStarPanel (star: Star) {
        if (star == undefined) {
            console.log("no star yet");
            return;
        }
        console.log("showing star details panel of ", star);
    }

    private getCursorPosition () {
        return this._camera.getWorldPosition(new Vector3())
            .add(this._camera.getWorldDirection(new Vector3())
                .multiplyScalar(5));
    }

    public moveStar () {
        if (this.moving.length == 1) {
            return;
        }
        this._raycaster.setFromCamera(new Vector2(0, 0), this._camera);
        const intersects = this._raycaster.intersectObjects(this.colliders, false);
        if (intersects.length == 0) {
            return;
        }
        const collider = intersects[0]?.object as Collider;
        if (!(collider instanceof Collider)) {
            return;
        }
        this.moving.push(collider.relatedStar);
        if (collider.relatedStar.starPaths.length > 0) {
            for (const i in collider.relatedStar.starPaths) {
                this.movingLine.push(collider.relatedStar.starPaths[i]);
            }
        }
    }

    public createLine () {
        this._raycaster.setFromCamera(new Vector2(0, 0), this._camera);
        const intersects = this._raycaster.intersectObjects(this.colliders, false);
        if (intersects.length == 0 || this.interacting.length == 0) {
            return;
        }
        const star1 = this.interacting[0];
        const star2 = intersects[0]?.object as Collider;
        this.starPaths.push(new StarPath(star1, star2.relatedStar, this._scene));
    }

    public _Update () {

        if (!this.movementControls) {
            return;
        }

        const elapsed = Date.now() - this.time;
        this.time = Date.now();
        const delta = elapsed / this.TICKRATE;

        this.movementControls?.update(delta);
        this.cameraControls?.getObject().position.add(this.movementControls.updatePlayer(delta))

        for (const i in this.stars) {
            this.stars[i].rotateLabel(this._camera.getWorldPosition(new Vector3));
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
            // console.log(this.linePoints);
            this.lineObject?.geometry.setFromPoints(this.linePoints);

        }
    }

    public render () {
        this._Update();
        this._threejs.render(this._scene, this._camera);
        this._labelRender.render(this._scene, this._camera);
    }
}