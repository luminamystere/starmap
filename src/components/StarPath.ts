import { BufferGeometry, CylinderGeometry, Line, LineBasicMaterial, MathUtils, Matrix4, Mesh, MeshBasicMaterial, Scene, Vector3 } from "three";
import Star from "./Star.js";
import World from "../World.js";

export default class StarPath {

    public star1: Star;
    public star2: Star;
    public linePoints: Vector3[] = [];
    public line?: Line;
    public cylinder?: Mesh;
    public distance?: number;
    public world: World;
    public id: number;

    public constructor (star1: Star, star2: Star, scene: Scene, world: World) {
        this.star1 = star1;
        this.star2 = star2;
        this.world = world;
        this.id = Date.now();
        this.createLine(scene);
    }

    public createLine (scene: Scene) {
        this.linePoints.push(this.star1.position, this.star2.position);
        const tempLineGeometry = new BufferGeometry().setFromPoints(this.linePoints);
        this.line = new Line(tempLineGeometry, new LineBasicMaterial({ color: 0xAA00000, linewidth: 5 }));
        scene.add(this.line);
        this.star1.addStarPath(this);
        this.star2.addStarPath(this);
        this.createCylinder();
        if (this.cylinder) {
            scene.add(this.cylinder);
        }

    }

    public createCylinder () {
        this.distance = this.getDistance();
        const material = new MeshBasicMaterial({ color: 0x00FF00 });
        const geometry = new CylinderGeometry(0.4, 0.4, this.distance, 6, 4, true);
        geometry.applyMatrix4(new Matrix4().makeTranslation(0, this.distance / 2, 0));
        geometry.applyMatrix4(new Matrix4().makeRotationX(MathUtils.degToRad(90)));
        this.cylinder = new Mesh(geometry, material);
        this.cylinder.position.copy(this.star1.position);
        this.cylinder.lookAt(this.star2.position);
    }

    public getDistance () {
        const direction = new Vector3().subVectors(this.star1.position, this.star2.position);
        return direction.length();
    }

    public updatePoint (linePos: Vector3, star: Star) {
        if (!this.line) {
            return;
        }
        let starMoving: Star;
        if (star == this.star1) {
            this.linePoints[0] = linePos;
            starMoving = this.star1;
        } else if (star == this.star2) {
            this.linePoints[1] = linePos;
            starMoving = this.star2;
        } else {
            return;
        }
        this.line.geometry.setFromPoints(this.linePoints);
        if (this.cylinder) {
            this.cylinder.geometry.dispose();
            this.distance = this.getDistance();
            this.cylinder.geometry = new CylinderGeometry(0.4, 0.4, this.distance, 6, 4, true)
            this.cylinder.geometry.applyMatrix4(new Matrix4().makeTranslation(0, this.distance / 2, 0));
            this.cylinder.geometry.applyMatrix4(new Matrix4().makeRotationX(MathUtils.degToRad(90)));
            this.cylinder.position.copy(this.star1.position);
            this.cylinder.lookAt(this.star2.position);
        }
    }

    public deleteStarPath () {
        this.star1.starPaths = this.star1.starPaths.filter(starpath => starpath !== this);
        this.star2.starPaths = this.star2.starPaths.filter(starpath => starpath !== this);
        this.world.starPaths = this.world.starPaths.filter(starpath => starpath !== this);
        if (this.cylinder) {
            if (this.cylinder.geometry) {
                this.cylinder.geometry.dispose();
            }
            if (this.cylinder.material instanceof Array) {
                this.cylinder.material.forEach(material => material.dispose());
            } else {
                this.cylinder.material.dispose();
            }
            this.cylinder.removeFromParent();
        }
        if (this.line) {
            if (this.line.geometry) {
                this.line.geometry.dispose();
            }
            if (this.line.material instanceof Array) {
                this.line.material.forEach(material => material.dispose());
            } else {
                this.line.material.dispose();
            }
            this.line.removeFromParent();
        }
    }
}