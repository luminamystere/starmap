//@ts-check
import * as THREE from "three";
import { createScene } from "./components/scene.js";
import MouseControls from "./systems/MouseControls.js"
import Math2 from "./utility/Math2.js";
import FlyMovement from "./systems/FlyMovement.js";
import Star from "./components/Star.js";
import Vector2 from "./utility/Vector2.js";
import Collider from "./components/Collider.js";

export default class World {

    public keyboard: Record<string, number> = {};
    public mouse: Record<string, number> = {};
    public _threejs: THREE.WebGLRenderer;
    public _camera: THREE.PerspectiveCamera;
    //public _placeRaycaster: THREE.Raycaster;
    public _raycaster: THREE.Raycaster;

    public _scene: THREE.Scene;
    public cameraControls?: MouseControls;
    public movementControls?: FlyMovement;
    public time = Date.now();
    public TIME_DILATION = 1;
    public SPEED_HORIZONTAL = 2;
    public SPEED_VERTICAL = 0.2;
    public TICKRATE = 1000 / 60;
    public SENSITIVITY = 500;

    public stars: Star[] = [];
    public colliders: THREE.Object3D[] = [];

    public playerVelocity = new THREE.Vector3();
    public playerDirection = new THREE.Vector3();
    public playerPosition = new THREE.Vector3();

    public constructor () {

        this._threejs = new THREE.WebGLRenderer();
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this._threejs.domElement);
        const fov = 90;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 1, 0);
        this._camera.rotation.order = 'YXZ';

        //this._placeRaycaster = new THREE.Raycaster(this._camera.position, new THREE.Vector3(0, 0, 0), 0, 10);
        this._raycaster = new THREE.Raycaster();
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
                this.showDetails();
            }
            else if (this.mouse[2]) {
                this.spawnOrb();
            }
        });
        document.body.addEventListener("mouseup", event => {
            delete this.mouse[event.button];
        });

        let light = new THREE.DirectionalLight(0xFFFFFF);
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

        const floor = new THREE.BoxGeometry(1, 1, 1);
        const ground = new THREE.Mesh(floor, new THREE.MeshBasicMaterial({ color: 0xAAAAAA }));
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
    }

    private lastRender = Date.now();

    public spawnOrb () {
        const star = new Star(`star number ${this.stars.length}`, new THREE.Color(0xAA0000),
            this.cameraControls?.getObject().position || new THREE.Vector3(0, 0, 0),
            this.stars.length.toString(),
            this._scene);
        this.stars.push(star);
        this.colliders.push(star.collider);
        for (const i in this.colliders) {
            console.log(this.colliders[i]);
        }
    }

    public showDetails () {
        this._raycaster.setFromCamera(new THREE.Vector2(0, 0), this._camera);
        const intersects = this._raycaster.intersectObjects(this.colliders, true);
        const collider = intersects[0]?.object as Collider;
        if (!(collider instanceof Collider)) {
            return;
        }
        console.log(collider.relatedStar.textField);
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
    }

    public render () {
        this._Update();
        this._threejs.render(this._scene, this._camera);


    }
}