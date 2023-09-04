import { Vector3 } from "three";
import World from "../World.js";

export default class FlyMovement {
    public SPEED_HORIZONTAL = 1.5;
    public SPEED_VERTICAL = 0.6;
    public FRICTION = 0.8;
    public world: World;

    public playerVelocity: Vector3;
    public playerDirection: Vector3;

    public constructor (world: World) {
        this.world = world;
        this.playerVelocity = world.playerVelocity;
        this.playerDirection = world.playerDirection;
    }

    public update (delta: number) {

        let forwardBackInput = 0;
        let leftRightInput = 0;
        let upDownInput = 0;

        if (document.documentElement.classList.contains("pointerlock-disabled")) {
            return;
        }

        if (this.world.keyboard["KeyW"]) {
            forwardBackInput++;
        }
        if (this.world.keyboard["KeyS"]) {
            forwardBackInput--;
        }
        if (this.world.keyboard["KeyA"]) {
            leftRightInput--;
        }
        if (this.world.keyboard["KeyD"]) {
            leftRightInput++;
        }
        if (this.world.keyboard["Space"]) {
            upDownInput++;
        }
        if (this.world.keyboard["ShiftLeft"]) {
            upDownInput--;
        }
        this.playerVelocity.add(this.getForwardVector().multiplyScalar(this.SPEED_HORIZONTAL * delta).multiplyScalar(forwardBackInput));
        this.playerVelocity.add(this.getSideVector().multiplyScalar(this.SPEED_HORIZONTAL * delta).multiplyScalar(leftRightInput));
        this.playerVelocity.y += (this.SPEED_VERTICAL * delta) * upDownInput;
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

    public updatePlayer (delta: number) {
        let damping = Math.exp(-4 * delta) - 1;
        this.playerVelocity.addScaledVector(this.playerVelocity, damping);
        const deltaPosition = this.playerVelocity.clone().multiplyScalar(delta);
        //this.world.playerPosition.add(deltaPosition);
        return deltaPosition;

    }
}
