import { Color, Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, Scene, SphereGeometry, Vector3 } from "three";
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
    public starHolder: Object3D;
    public starMaterial?: MeshStandardMaterial;
    public collider: Collider;
    public faction?: Faction;
    public factionMesh: Mesh;
    public factionMaterial: MeshBasicMaterial;
    public index: number;
    private _name: string;
    public get name () {
        return this._name;
    }
    public set name (input: string) {
        this._name = input;
        this.updateLabel();
    }
    public description: string;
    public starLabel?: CSS2DObject;
    public starPaths: StarPath[] = [];
    public world: World;

    public constructor (name: string, colour: Color, position: Vector3, scene: Scene, world: World) {
        this._colour = colour;
        this.position = position;
        this._name = name;
        this.description = "Add text here!";
        this.world = world;
        this.starHolder = new Object3D();
        this.starHolder.position.set(this.position.x, this.position.y, this.position.z);
        this.starHolder.scale.set(1, 1, 1);
        this.starHolder.updateMatrix();
        scene.add(this.starHolder);
        this.index = this.world.starMesh.count;
        this.createStar();
        this.collider = this.createCollider(scene);
        this.factionMaterial = this.createFactionMaterial();
        this.factionMesh = this.createFactionSphere(scene);
        this.createLabel();
        this.updatePosition();
        this.unHoverStar();
        this.updateColour();
    }


    public createStar () {
        this.world.starMesh.setMatrixAt(this.index, this.starHolder.matrix);
        this.world.starMesh.instanceMatrix.needsUpdate = true;
        this.world.starMesh.computeBoundingSphere();
        this.world.starMesh.count += 1;
    }

    public createCollider (scene: Scene) {
        const collider = new Collider(this);
        this.collider = collider;
        scene.add(this.collider);
        return collider;
    }

    public createFactionSphere (scene: Scene) {
        const geometry = new SphereGeometry(2, 32, 32);
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
        this.starLabel.position.set(0, 0.5, 0);
        this.starHolder.add(this.starLabel);
    }

    public updateLabel () {
        if (this.starLabel) {
            this.starLabel.element.firstElementChild!.textContent = this._name;
        }
    }

    public updateLabelScale (position: Vector3) {
        if (!this.starLabel) {
            return;
        }
        const distance = new Vector3().subVectors(this.position, position).length();
        const distanceScaleValue = 50;
        const minSize = 0.05;
        const maxSize = 0.4;
        const scale = Math2.clamp(minSize, maxSize, minSize + (1 - (distance / distanceScaleValue)) * (maxSize - minSize));
        (this.starLabel.element.firstElementChild as HTMLElement).style.transform = `scale(${scale})`;
        (this.starLabel.element.firstElementChild as HTMLElement).style.opacity = `${1 - (distance / distanceScaleValue)}`;
    }

    public addStarPath (path: StarPath) {
        this.starPaths.push(path);
    }

    public updatePosition () {
        this.starHolder.position.set(this.position.x, this.position.y, this.position.z);
        this.starHolder.updateMatrix();
        this.world.starMesh.setMatrixAt(this.index, this.starHolder.matrix);
        this.world.starMesh.instanceMatrix.needsUpdate = true;
        this.world.starMesh.computeBoundingSphere();
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
            // this.factionMaterial.emissive = new Color(0xFFFFFF);
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
            // this.factionMaterial.emissive = colour;
        }
        if (this.factionMesh.material instanceof Array) {
            this.factionMesh.material.forEach(material => material.dispose());
        } else {
            this.factionMesh.material.dispose();
        }
        this.factionMesh.material = this.factionMaterial;
    }

    public updateColour () {
        this.world.starMesh.setColorAt(this.index, this._colour);
        if (this.world.starMesh.instanceColor) {
            this.world.starMesh.instanceColor.needsUpdate = true;
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
        this.factionMesh.geometry.dispose();
        if (this.factionMaterial instanceof Array) {
            this.factionMaterial.forEach(material => material.dispose());
        } else {
            this.factionMaterial.dispose();
        }
        this.factionMesh.removeFromParent();

        const replacementStar = this.world.stars.find((element) => element.index == (this.world.starMesh.count - 1));
        if (replacementStar == null) {
            return;
        }
        replacementStar.index = this.index;
        this.world.starMesh.setMatrixAt(replacementStar.index, replacementStar.starHolder.matrix);
        this.world.starMesh.instanceMatrix.needsUpdate = true;
        this.world.starMesh.computeBoundingSphere();
        this.world.starMesh.count -= 1;
        replacementStar.updatePosition();

    }

}