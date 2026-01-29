import { Object3D, Vector2 } from "three";
import Store from "../utility/Store.js";
const PI_2 = Math.PI / 2;
export default class MouseControls {
    constructor(world) {
        this.SENSITIVITY = 0.5;
        this.LISTENER_SENS = 500;
        this.SKIP_THRESHOLD = 1;
        this.SKIP_DELAY = 1;
        this.enabled = false;
        this.lastAppliedMovementX = 0;
        this.delayedMovement = [];
        this.onMouseMove = this.onMouseMove.bind(this);
        this.pitchObject = new Object3D();
        this.camera = world._camera;
        this.yawObject = new Object3D()
            .add(this.pitchObject);
        document.addEventListener("mousemove", this.onMouseMove, false);
        document.body.addEventListener("click", () => this.lockMouse());
        document.addEventListener("pointerlockchange", () => {
            this.enabled = document.pointerLockElement === document.body;
            document.documentElement.classList.toggle("has-focus", this.enabled);
        });
    }
    lockMouse() {
        if (!document.documentElement.classList.contains("pointerlock-disabled")) {
            document.body.requestPointerLock();
        }
    }
    initialise(scene) {
        scene.add(this.yawObject);
    }
    uninitialise(scene) {
        scene.remove(this.yawObject);
    }
    setCamera(camera) {
        if (this.camera)
            this.pitchObject.remove(this.camera);
        camera.rotation.set(0, 0, 0);
        this.pitchObject.add(this.camera = camera);
    }
    getObject() {
        return this.yawObject;
    }
    dispose() {
        document.removeEventListener("mousemove", this.onMouseMove, false);
    }
    //@Bound
    onMouseMove(event) {
        if (this.enabled === false)
            return;
        const movementX = (event.movementX || 0) * (Store.invertX ? -1 : 1);
        const movementY = (event.movementY || 0) * (Store.invertY ? -1 : 1);
        if (!movementX && !movementY)
            return;
        const lastAppliedMovementX = this.lastAppliedMovementX;
        if (Math.abs(movementX) > Math.abs(lastAppliedMovementX) && Math.abs(movementX - lastAppliedMovementX) > this.SKIP_THRESHOLD) {
            this.delayedMovement.push(new Vector2(movementX, movementY));
            if (this.delayedMovement.length > this.SKIP_DELAY) {
                for (const delayedMovement of this.delayedMovement) {
                    this.applyMovement(delayedMovement.x, delayedMovement.y);
                    this.delayedMovement.splice(0, Infinity);
                }
            }
            return;
        }
        if (this.delayedMovement.length)
            this.delayedMovement.splice(0, Infinity);
        this.applyMovement(movementX, movementY);
    }
    serialise() {
        return {
            pitch: this.pitchObject.rotation.x,
            yaw: this.yawObject.rotation.y
        };
    }
    deserialise(angle) {
        this.pitchObject.rotation.x = angle.pitch;
        this.yawObject.rotation.y = angle.yaw;
    }
    applyMovement(movementX, movementY) {
        this.lastAppliedMovementX = movementX;
        this.yawObject.rotation.y -= movementX * 0.002 * (Store.sensitivity ?? this.SENSITIVITY);
        this.pitchObject.rotation.x -= movementY * 0.002 * (Store.sensitivity ?? this.SENSITIVITY);
        this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
    }
}
