//@ts-check
import * as THREE from "three";
import { createScene } from "./components/scene.js";
import MouseControls from "./systems/MouseControls.js"
import Math2 from "./utility/Math2.js";
import FlyMovement from "./systems/FlyMovement.js";

export default class World {

    public keyboard: Record<string, number> = {};
    public _threejs: THREE.WebGLRenderer;
    public _camera: THREE.PerspectiveCamera;

    public _scene: THREE.Scene;
    public cameraControls?: MouseControls;
    public movementControls?: FlyMovement;
    public time = Date.now();
    public TIME_DILATION = 1;
    public SPEED_HORIZONTAL = 2;
    public SPEED_VERTICAL = 0.2;
    public TICKRATE = 1000 / 60;
    public SENSITIVITY = 500;

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