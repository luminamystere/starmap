//import { InScene } from "game/object/Feature";
import { Camera, Euler, Object3D, Scene, Vector3 } from "three";
//import Bound from "util/Bound";
//import Configurable from "util/config/Configurable";
import Vector2 from "../utility/Vector2.js";
import World from "../World.js";

const PI_2 = Math.PI / 2;

//@InScene
export default class MouseControls {

    // @Configurable("controls", {
    //     label: "settings/controls/mouse/sensitivity",
    //     value: Configurable.number({ min: 0.01, max: 2, default: 1 }),
    // })
    public SENSITIVITY = 0.5;
    public LISTENER_SENS = 500;

    // @Configurable("controls", {
    //     label: "settings/controls/mouse/skipThreshold",
    //     description: "settings/controls/mouse/skipThreshold/description",
    //     order: -1,
    //     value: Configurable.number({ min: 50, max: 700, step: 5, default: 300 }),
    // })
    public SKIP_THRESHOLD = 1;

    // @Configurable("controls", {
    //     label: "settings/controls/mouse/skipDelay",
    //     description: "settings/controls/mouse/skipDelay/description",
    //     order: -1,
    //     value: Configurable.number({ min: 0, max: 5, step: 1, default: 1 }),
    // })
    public SKIP_DELAY = 1;

    // @Configurable("controls", {
    //     label: "settings/controls/mouse/invertY",
    //     value: Configurable.boolean({ default: false }),
    // })
    // public INVERT_Y: boolean;

    // @Configurable("controls", {
    //     display: false,
    //     value: Configurable.boolean({ default: false }),
    // })
    // public INVERT_X: boolean;

    ////////////////////////////////////

    private camera: Camera;

    private readonly pitchObject: Object3D;
    private readonly yawObject: Object3D;
    private direction: Vector3;
    private rotation: Euler;

    private enabled = false;

    public constructor (world: World) {
        this.onMouseMove = this.onMouseMove.bind(this);
        this.pitchObject = new Object3D();
        this.camera = world._camera;

        this.yawObject = new Object3D()
            .add(this.pitchObject);

        this.direction = new Vector3(0, 0, -1);
        this.rotation = new Euler(0, 0, 0, "YXZ");

        document.addEventListener("mousemove", this.onMouseMove, false);
        // document.addEventListener("mousemove", (event) => {
        //     if (document.pointerLockElement === document.body) {
        //         this.camera.rotation.y -= event.movementX / this.LISTENER_SENS;
        //         this.camera.rotation.x -= event.movementY / this.LISTENER_SENS;
        //     }
        // });
        document.body.addEventListener("click", () => !document.documentElement.classList.contains("pointerlock-disabled")
            && document.body.requestPointerLock());
        document.addEventListener("pointerlockchange", () => {
            this.enabled = document.pointerLockElement === document.body;
            document.documentElement.classList.toggle("has-focus", this.enabled);
        });
    }

    public initialise (scene: Scene) {
        scene.add(this.yawObject);
    }

    public uninitialise (scene: Scene) {
        scene.remove(this.yawObject);
    }

    public setCamera (camera: Camera) {
        if (this.camera) this.pitchObject.remove(this.camera);

        camera.rotation.set(0, 0, 0);
        this.pitchObject.add(this.camera = camera);
    }

    public getObject () {
        return this.yawObject;
    }

    public getDirection (v: Vector3) {
        this.rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);
        v.copy(this.direction).applyEuler(this.rotation);
        return v;
    }

    public dispose () {
        document.removeEventListener("mousemove", this.onMouseMove, false);
    }

    private lastAppliedMovementX = 0;
    private readonly delayedMovement: Vector2[] = [];

    //@Bound
    private onMouseMove (event: MouseEvent) {
        if (this.enabled === false)
            return;

        const movementX = (event.movementX || 0);
        const movementY = (event.movementY || 0);

        if (!movementX && !movementY)
            return;

        const lastAppliedMovementX = this.lastAppliedMovementX;

        if (Math.abs(movementX) > Math.abs(lastAppliedMovementX) && Math.abs(movementX - lastAppliedMovementX) > this.SKIP_THRESHOLD) {
            this.delayedMovement.push(new Vector2(movementX, movementY));

            if (this.delayedMovement.length > this.SKIP_DELAY) {
                for (const delayedMovement of this.delayedMovement) {
                    this.applyMovement(...delayedMovement.xy);
                    this.delayedMovement.splice(0, Infinity);
                }
            }

            return;
        }

        if (this.delayedMovement.length)
            this.delayedMovement.splice(0, Infinity);

        this.applyMovement(movementX, movementY);
    }

    private applyMovement (movementX: number, movementY: number) {
        this.lastAppliedMovementX = movementX;

        this.yawObject.rotation.y -= movementX * 0.002 * this.SENSITIVITY;
        this.pitchObject.rotation.x -= movementY * 0.002 * this.SENSITIVITY;

        this.pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
    }
}
