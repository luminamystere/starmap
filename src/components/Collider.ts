import { Mesh, MeshBasicMaterial, SphereGeometry } from "three"
import Star from "./Star.js"

export default class Collider extends Mesh {

    public readonly relatedStar: Star;

    public constructor (star: Star) {
        const geometry = new SphereGeometry(0.4, 16, 16);
        const material = new MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0 });
        material.transparent = true;
        material.visible = false;
        super(geometry, material);
        this.relatedStar = star;
        this.position.set(star.position.x, star.position.y, star.position.z);
    }

}