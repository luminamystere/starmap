import { BufferGeometry, Color, CylinderGeometry, Line, LineBasicMaterial, LineDashedMaterial, MathUtils, Matrix4, Mesh, MeshBasicMaterial, Scene, Vector3 } from "three";
import Star from "./Star.js";
import World from "../World.js";

export default class StarPath extends Mesh {

    public star1: Star;
    public star2: Star;
    public starpathMaterial?: MeshBasicMaterial;
    public _colour: Color;
    public get starpathColour () {
        return `#${this._colour.getHexString()}`;
    }
    public set starColour (input: `#${string}`) {
        this._colour = new Color(input);
        this.updateColour();
    }
    public linePoints: Vector3[] = [];
    public line: Line;
    public isDashed: Boolean;
    public world: World;
    public timeCreated: number;

    public constructor (star1: Star, star2: Star, scene: Scene, world: World) {
        const material = new MeshBasicMaterial({ color: 0xCCCCCC });
        material.transparent = true;
        material.opacity = 0;
        const direction = new Vector3().subVectors(star1.position, star2.position);
        const distance = direction.length();
        const geometry = new CylinderGeometry(0.05, 0.05, distance, 3, 4, true)
        geometry.applyMatrix4(new Matrix4().makeTranslation(0, distance / 2, 0));
        geometry.applyMatrix4(new Matrix4().makeRotationX(MathUtils.degToRad(90)));
        super(geometry, material);
        scene.add(this);
        this.position.copy(star1.position);
        this.lookAt(star2.position);
        this.star1 = star1;
        this.star2 = star2;
        this.world = world;
        this._colour = new Color(0xCCCCCC);
        this.starpathMaterial = material;
        this.timeCreated = Date.now();
        this.isDashed = false;
        this.line = this.createLine(scene);
    }

    public createLine (scene: Scene) {
        this.linePoints.push(this.star1.position, this.star2.position);
        const tempLineGeometry = new BufferGeometry().setFromPoints(this.linePoints);
        if (this.isDashed) {
            const lineMaterial = new LineDashedMaterial({ color: this.world._starpathDefaultColor, linewidth: 1, scale: 1, gapSize: 0.2, dashSize: 0.4 })
            this.line = new Line(tempLineGeometry, lineMaterial);
        } else {
            const lineMaterial = new LineBasicMaterial({ color: this.world._starpathDefaultColor, linewidth: 1 })
            this.line = new Line(tempLineGeometry, lineMaterial);
        }
        this.line.computeLineDistances();
        scene.add(this.line);
        this.star1.addStarPath(this);
        this.star2.addStarPath(this);
        return this.line;

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
        this.line.computeLineDistances();
        this.line.geometry.setFromPoints(this.linePoints);
        this.line.geometry.computeBoundingSphere();
        if (this.geometry) {
            this.geometry.dispose();
            const distance = this.getDistance();
            this.geometry = new CylinderGeometry(0.05, 0.05, distance, 3, 4, true)
            // this.layers.set(1);
            this.geometry.applyMatrix4(new Matrix4().makeTranslation(0, distance / 2, 0));
            this.geometry.applyMatrix4(new Matrix4().makeRotationX(MathUtils.degToRad(90)));
            this.position.copy(this.star1.position);
            this.lookAt(this.star2.position);
        }
    }

    public updateColour () {
        this._colour = this.world._starpathDefaultColor;
        if (this.line.material instanceof LineBasicMaterial) {
            this.line.material.color.set(this._colour);
        } else if (this.line.material instanceof LineDashedMaterial) {
            this.line.material.color.set(this._colour);
        }
    }

    public setDashed () {
        if (this.isDashed) {
            if (this.line.material instanceof Array) {
                this.line.material.forEach(material => material.dispose());
            } else {
                this.line.material.dispose();
            }
            this.line.material = new LineDashedMaterial({ color: this._colour, linewidth: 1, scale: 1, gapSize: 0.2, dashSize: 0.4 });
        } else {
            if (this.line.material instanceof Array) {
                this.line.material.forEach(material => material.dispose());
            } else {
                this.line.material.dispose();
            }
            this.line.material = new LineBasicMaterial({ color: this._colour, linewidth: 1 });
        }
    }

    public deleteStarPath () {
        this.star1.starPaths = this.star1.starPaths.filter(starpath => starpath !== this);
        this.star2.starPaths = this.star2.starPaths.filter(starpath => starpath !== this);
        this.world.starPaths = this.world.starPaths.filter(starpath => starpath !== this);

        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material instanceof Array) {
            this.material.forEach(material => material.dispose());
        } else {
            this.material.dispose();
        }
        this.removeFromParent();

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