import { BufferGeometry, Line, LineBasicMaterial, Scene, Vector3 } from "three";
import Star from "./Star.js";

export default class StarPath {

    public star1: Star;
    public star2: Star;
    public linePoints: Vector3[] = [];

    public constructor (star1: Star, star2: Star, scene: Scene) {
        this.star1 = star1;
        this.star2 = star2;
        this.createLine(scene);
    }

    public createLine (scene: Scene) {
        this.linePoints.push(this.star1.position, this.star2.position);
        const tempLineGeometry = new BufferGeometry().setFromPoints(this.linePoints);
        const tempLine = new Line(tempLineGeometry, new LineBasicMaterial({ color: 0xAA00000, linewidth: 5 }));
        scene.add(tempLine);
        this.star1.addStarPath(this);
        this.star2.addStarPath(this);
    }

    public updatePoint (linePos: Vector3, star: Star) {

    }

    public createCylinder (star1: Star, star2: Star) {

    }

    public moveCylinder () {

    }
}