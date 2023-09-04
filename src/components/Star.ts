import { Color, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhysicalMaterial, Object3D, Scene, SphereGeometry, Vector3 } from "three";
import Collider from "./Collider.js";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import StarPath from "./StarPath.js";
import World from "../World.js";
import Faction from "./Faction.js";
import Math2 from "../utility/Math2.js";

export default class Star {

    public _colour: Color;
    public get starColour () {
        return `#${this._colour.getHexString()}`;
    }
    public set starColour (input: `#${string}`) {
        this._colour = new Color(input);
        this.updateColour();
    }
    public position: Vector3;
    public mesh?: Mesh;
    public starMaterial?: MeshBasicMaterial;
    public collider: Collider;
    public faction?: Faction;
    public factionMesh: Mesh;
    public factionMaterial: MeshBasicMaterial;
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
    public world: World;

    public constructor (name: string, colour: Color, position: Vector3, scene: Scene, world: World) {
        this._colour = colour;
        this.position = position;
        this._name = name;
        this.description = "this is star no. " + name;
        this.world = world;
        this.createStar(scene);
        this.collider = this.createCollider(scene);
        this.factionMaterial = this.createFactionMaterial();
        this.factionMesh = this.createFactionSphere(scene);
        this.createLabel();
        this.unHoverStar();
    }


    public createStar (scene: Scene) {
        const geometry = new SphereGeometry(0.5, 16, 16);
        this.starMaterial = new MeshBasicMaterial({ color: this._colour });
        this.mesh = new Mesh(geometry, this.starMaterial);
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

    public createFactionSphere (scene: Scene) {
        const geometry = new SphereGeometry(2, 32, 32);
        // this.factionMaterial = new MeshBasicMaterial({ color: 0xFFFFFF });
        // this.factionMaterial.transparent = true;
        // this.factionMaterial.opacity = 0.6;
        this.factionMesh = new Mesh(geometry, this.factionMaterial);
        this.factionMesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
        scene.add(this.factionMesh);
        return this.factionMesh;
    }

    public createFactionMaterial () {
        this.factionMaterial = new MeshBasicMaterial({ color: 0xFFFFFF });
        this.factionMaterial.transparent = true;
        this.factionMaterial.opacity = 0.6;
        return this.factionMaterial;
    }

    public get currentMesh () {
        return this.mesh;
    }

    public get currentCollider () {
        return this.collider;
    }

    public createLabel () {
        const container = document.createElement('div');
        const starDiv = document.createElement('div');
        container.append(starDiv);
        starDiv.className = 'label';
        starDiv.textContent = this._name.toString();
        this.starLabel = new CSS2DObject(container);
        (this.starLabel.element.firstElementChild as HTMLElement).style.transform = `scale(1)`;
        this.starLabel.position.set(0, 0.8, 0);
        this.mesh?.add(this.starLabel);
    }

    public updateLabel () {
        if (this.starLabel) {
            this.starLabel.element.textContent = this._name;
        }
    }

    public updateLabelScale (position: Vector3) {
        if (!this.starLabel) {
            return;
        }
        const distance = new Vector3().subVectors(this.position, position).length();
        const scale = Math2.clamp(0.5, 3, 4 - (distance / 5));
        (this.starLabel.element.firstElementChild as HTMLElement).style.transform = `scale(${scale})`;
        // console.log("distance:", distance, "\nscale:", scale);
    }

    public addStarPath (path: StarPath) {
        this.starPaths.push(path);
    }

    public rotateLabel (camera: Vector3) {
        if (!this.starLabel) {
            return;
        }
        this.starLabel.lookAt(camera);
    }

    public updatePosition () {
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }
        this.collider.position.set(this.position.x, this.position.y, this.position.z);
        if (this.factionMesh) {
            this.factionMesh.position.set(this.position.x, this.position.y, this.position.z);
        }
    }

    public hoverStar () {
        this.factionMaterial.opacity = 0.4;
        if (this.factionMesh.material instanceof Array) {
            this.factionMesh.material.forEach(material => material.dispose());
        } else {
            this.factionMesh.material.dispose();
        }
        this.factionMesh.material = this.factionMaterial;

    }

    public unHoverStar () {
        this.factionMaterial.opacity = 0;
        if (this.factionMesh.material instanceof Array) {
            this.factionMesh.material.forEach(material => material.dispose());
        } else {
            this.factionMesh.material.dispose();
        }
        this.factionMesh.material = this.factionMaterial;
    }

    public updateFaction (input: string) {
        if (input == "None") {
            this.factionMaterial.color = new Color(0xFFFFFF);
            delete this.faction;
        } else {
            //look up faction by name
            const faction = this.world.factions.find((element) => element.name == input);
            if (faction == null) {
                return;
            }
            this.faction = faction;
            const colour = new Color(faction.colour);
            this.factionMaterial.color = colour;
        }
        if (this.factionMesh.material instanceof Array) {
            this.factionMesh.material.forEach(material => material.dispose());
        } else {
            this.factionMesh.material.dispose();
        }
        this.factionMesh.material = this.factionMaterial;
    }

    public updateColour () {
        if (this.mesh) {
            if (this.mesh.material instanceof Array) {
                this.mesh.material.forEach(material => material.dispose());
            } else {
                this.mesh.material.dispose();
            }
            this.starMaterial = new MeshBasicMaterial({ color: this._colour });
            this.mesh.material = this.starMaterial;

        }
    }

    public delete () {
        for (let i = this.starPaths.length - 1; i >= 0; i--) {
            this.starPaths[i].deleteStarPath();
        }
        this.world.stars = this.world.stars.filter(star => star !== this);
        this.world.colliders = this.world.colliders.filter(collider => collider !== this.collider);
        if (this.starLabel) {
            this.starLabel.removeFromParent();
        }
        if (this.collider) {
            if (this.collider.geometry) {
                this.collider.geometry.dispose();
            }
            if (this.collider.material instanceof Array) {
                this.collider.material.forEach(material => material.dispose());
            } else {
                this.collider.material.dispose();
            }
            this.collider.removeFromParent();
        }
        if (this.mesh) {
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            if (this.mesh.material instanceof Array) {
                this.mesh.material.forEach(material => material.dispose());
            } else {
                this.mesh.material.dispose();
            }
            this.mesh.removeFromParent();
        }
    }

    public showDetails () {
        console.log("got here successfully");
    }
}