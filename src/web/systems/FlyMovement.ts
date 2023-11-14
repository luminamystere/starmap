import { Vector3 } from "three";
import World from "../World.js";
import Math2 from "../utility/Math2.js";
import Store from "../utility/Store.js";
import InputManager from "./InputManager.js";

export default class FlyMovement {
    public SPEED_HORIZONTAL = 0.8;
    public SPEED_MINIMUM = 0.01;
    public SPEED_MULTIPLIER: number;
    public SPEED_VERTICAL = 0.6;
    public FRICTION = 0.8;
    public world: World;

    public playerVelocity: Vector3;
    public playerDirection: Vector3;

    public constructor (world: World, speedMultiplier: number) {
        this.world = world;
        this.playerVelocity = world.playerVelocity;
        this.playerDirection = world.playerDirection;
        this.SPEED_MULTIPLIER = speedMultiplier;
        this.changeSpeed(speedMultiplier);
    }

    public changeSpeed (diff: number) {
        this.SPEED_MULTIPLIER = this.SPEED_MINIMUM * diff;
        this.SPEED_MULTIPLIER = Math2.clamp(0.01, 0.1, this.SPEED_MULTIPLIER);
    }

    public update (delta: number) {
        this.playerVelocity.multiplyScalar(this.FRICTION ** delta);

        let forwardBackInput = 0;
        let leftRightInput = 0;
        let upDownInput = 0;

        if (document.documentElement.classList.contains("pointerlock-disabled")) {
            return;
        }

        if (InputManager.isDown(Store.keyForward)) {
            forwardBackInput++;
        }
        if (InputManager.isDown(Store.keyBack)) {
            forwardBackInput--;
        }
        if (InputManager.isDown(Store.keyLeft)) {
            leftRightInput--;
        }
        if (InputManager.isDown(Store.keyRight)) {
            leftRightInput++;
        }
        if (InputManager.isDown(Store.keyUp)) {
            upDownInput++;
        }
        if (InputManager.isDown(Store.keyDown)) {
            upDownInput--;
        }
        this.playerVelocity.add(this.getForwardVector().multiplyScalar((this.SPEED_HORIZONTAL * this.SPEED_MULTIPLIER) * delta).multiplyScalar(forwardBackInput));
        this.playerVelocity.add(this.getSideVector().multiplyScalar((this.SPEED_HORIZONTAL * this.SPEED_MULTIPLIER) * delta).multiplyScalar(leftRightInput));
        this.playerVelocity.y += ((this.SPEED_VERTICAL * this.SPEED_MULTIPLIER) * delta) * upDownInput;
    }

    public getForwardVector () {
        this.world._camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();

        return this.playerDirection;
    }

    public getSideVector () {
        this.world._camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        this.playerDirection.cross(this.world._camera.up);

        return this.playerDirection;
    }

    public getMovementVector (delta: number) {
        return this.playerVelocity.clone().multiplyScalar(delta);
    }
}
