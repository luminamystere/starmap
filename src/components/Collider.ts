import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three"
import Star from "./Star.js"

export default class Collider extends Mesh {

    public readonly relatedStar: Star;
    //public position: Vector3;

    public constructor (star: Star) {
        const geometry = new SphereGeometry(1, 16, 16);
        const material = new MeshBasicMaterial({ color: 0x000000, opacity: 0 });
        material.transparent = true;
        super(geometry, material);
        this.relatedStar = star;
        this.position.set(star.position.x, star.position.y, star.position.z);
    }

}