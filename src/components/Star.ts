import { Color, Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry, Vector3 } from "three";
import Collider from "./Collider.js";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import StarPath from "./StarPath.js";

export default class Star {

    public starColour: Color;
    public position: Vector3;
    public mesh?: Mesh;
    public collider: Collider;
    private _name: string;
    public get name () {
        return this._name;
    }
    public set name (input: string) {
        this._name = input;
        this.updateLabel();
    }
    public description: string;
    public starLabel?: CSS3DObject;
    public starPaths: StarPath[] = [];

    public constructor (name: string, colour: Color, position: Vector3, scene: Scene) {
        this.starColour = colour;
        this.position = position;
        this._name = name;
        this.description = "this is star no. " + name;
        this.createStar(scene);
        this.collider = this.createCollider(scene);
        this.createLabel();
    }


    public createStar (scene: Scene) {
        const geometry = new SphereGeometry(0.5, 16, 16);
        this.mesh = new Mesh(geometry, new MeshBasicMaterial({ color: 0x3BDE41 }));
        this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
        this.mesh.name = this.name.toString();
        scene.add(this.mesh);
    }

    public createCollider (scene: Scene) {
        const collider = new Collider(this);
        this.collider = collider;
        scene.add(this.collider);
        return collider;
    }

    public get currentMesh () {
        return this.mesh;
    }

    public get currentCollider () {
        return this.collider;
    }

    public createLabel () {
        const starDiv = document.createElement('div');
        starDiv.className = 'label';
        starDiv.textContent = this._name.toString();
        this.starLabel = new CSS3DObject(starDiv);
        this.starLabel.scale.set(0.005, 0.005, 0.005);
        this.starLabel.position.set(0, 0.8, 0);
        this.mesh?.add(this.starLabel);
    }

    public updateLabel () {
        if (this.starLabel) {
            this.starLabel.element.textContent = this._name;
        }
    }

    public addStarPath (path: StarPath) {
        this.starPaths.push(path);
    }

    public rotateLabel (camera: Vector3) {
        if (!this.starLabel) {
            return;
        }
        this.starLabel.lookAt(camera);
        // this.starLabel?.rotation.set(0, this.starLabel.rotation.y, 0);
        // this.starLabel.rotation.x = 0;
        // this.starLabel.rotation.y = 0;
        // this.starLabel.rotation.z = 0;
    }

    public updatePosition () {
        this.mesh?.position.set(this.position.x, this.position.y, this.position.z);
        this.collider.position.set(this.position.x, this.position.y, this.position.z);
    }

    public showDetails () {
        console.log("got here successfully");
    }
}