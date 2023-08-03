import { Color, Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry, Vector3 } from "three";
import Collider from "./Collider.js";

export default class Star {

    public textField: String;
    public starColour: Color;
    public position: Vector3;
    public mesh?: Mesh;
    public collider: Collider;
    public name: String;

    public constructor (text: String, colour: Color, position: Vector3, name: String, scene: Scene) {
        this.starColour = colour;
        this.textField = text;
        this.position = position;
        this.name = name;
        this.createStar(scene);
        this.collider = this.createCollider(scene);
    }


    public createStar (scene: Scene) {
        const geometry = new SphereGeometry(0.5, 16, 16);
        this.mesh = new Mesh(geometry, new MeshBasicMaterial({ color: 0x3BDE41 }));
        this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
        this.mesh.name = this.name.toString();
        scene.add(this.mesh);
        //this.createCollider(scene);
        // console.log("spawned star at ", this.position);
    }

    public createCollider (scene: Scene) {
        const collider = new Collider(this);
        this.collider = collider;
        scene.add(this.collider);
        // console.log("created collider ", this.collider);
        return collider;
    }

    public get currentMesh () {
        return this.mesh;
    }

    public get currentCollider () {
        return this.collider;
    }

    public showDetails () {
        // console.log("got here successfully");
    }
}