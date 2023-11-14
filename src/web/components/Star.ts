import { Color, DoubleSide, Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, Scene, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import Collider from "./Collider.js";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import StarPath from "./StarPath.js";
import World from "../World.js";
import Faction from "./Faction.js";
import Math2 from "../utility/Math2.js";
import { debounce } from "../utility/Async.js";
import FactionShaderMaterial from "./shaders/FactionShaderMaterial.js";

export default class Star {

    private _colour: Color;
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
    //#pro
    public factionMesh: Mesh;
    public factionMaterial: FactionShaderMaterial;
    //#endpro
    public index: number;
    private _name: string;
    public get name () {
        return this._name;
    }
    public set name (input: string) {
        this._name = input;
        this.updateLabel();
    }
    private _description: string;
    public get description () {
        return this._description;
    }
    public set description (input: string) {
        this._description = input;
    }
    //#pro
    private _factionSize: number;
    public get factionSize () {
        return this._factionSize;
    }
    public set factionSize (input: number) {
        this._factionSize = input;
        console.log(this._factionSize);
        this.updateFactionSize(this._factionSize);
    }
    //#endpro
    public starLabel?: CSS2DObject;
    public starPaths: StarPath[] = [];
    public world: World;

    public constructor (name: string, description: string, colour: Color, position: Vector3, scene: Scene, world: World) {
        this._colour = colour;
        this.position = position;
        this._name = name;
        this._description = description;
        this.world = world;
        this.starHolder = new Object3D();
        this.starHolder.position.set(this.position.x, this.position.y, this.position.z);
        this.starHolder.scale.set(1, 1, 1);
        this.starHolder.updateMatrix();
        scene.add(this.starHolder);
        this.index = this.world.starMesh.count;
        this.createStar();
        this.collider = this.createCollider(scene);
        //#pro
        this._factionSize = 4;
        this.factionMaterial = this.createFactionMaterial();
        this.factionMesh = this.createFactionSphere(scene);
        this.updateFactionSize(this._factionSize);
        //#endpro
        this.updateLabel();
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
    //#pro
    public createFactionSphere (scene: Scene) {
        const geometry = new SphereGeometry(1, 32, 32);
        this.factionMesh = new Mesh(geometry, this.factionMaterial);
        this.factionMesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
        scene.add(this.factionMesh);
        return this.factionMesh;
    }


    public createFactionMaterial () {
        const factionColour = new Color(this.faction?.colour || 0x000000)
        const vectorColour = new Vector3(factionColour.r, factionColour.g, factionColour.b);
        this.factionMaterial = new FactionShaderMaterial({
            uniforms: {
                sphereColour: {
                    value: vectorColour
                }
            },
        });
        this.factionMaterial.transparent = true;
        this.factionMaterial.visible = false;
        return this.factionMaterial;
    }
    //#endpro

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
        if (!this.starLabel && this._name !== "") {
            this.createLabel();
            this.updateLabelScale(this.world._camera.getWorldPosition(new Vector3));
        } else if (this.starLabel && this._name !== "") {
            this.starLabel.element.firstElementChild!.textContent = this._name;
            this.updateLabelScale(this.world._camera.getWorldPosition(new Vector3));
        } else if (this.starLabel && this._name == "") {
            while (this.starLabel.element.lastElementChild) {
                this.starLabel.element.removeChild(this.starLabel.element.lastElementChild);
            }
            this.starLabel.removeFromParent();
            delete this.starLabel;
        }
        this.world.saveLocalStorage();
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
        //#pro
        if (this.factionMesh) {
            this.factionMesh.position.set(this.position.x, this.position.y, this.position.z);
        }
        //#endpro
    }

    public hoverStar () {
        if (this.collider.material instanceof Array) {
            this.collider.material.forEach(material => {
                material.opacity = 0.4;
                material.visible = true;
            });
        } else {
            this.collider.material.opacity = 0.4;
            this.collider.material.visible = true;
        }
    }

    public unHoverStar () {
        if (this.collider.material instanceof Array) {
            this.collider.material.forEach(material => {
                material.opacity = 0;
                material.visible = false;
            });
        } else {
            this.collider.material.opacity = 0;
            this.collider.material.visible = false;;
        }
    }
    //#pro
    public updateFaction (input: string) {
        if (input == "None") {
            this.factionMaterial.uniforms.sphereColour = {
                value: new Vector3(0, 0, 0)
            };
            this.factionMaterial.visible = false;
            delete this.faction;
        } else {
            //look up faction by name
            const faction = this.world.factions.find((element) => element.name == input);
            if (faction == null) {
                return;
            }
            this.faction = faction;
            const factionColour = new Color(this.faction.colour);
            const vectorColour = new Vector3(factionColour.r, factionColour.g, factionColour.b);
            this.factionMaterial.uniforms.sphereColour = {
                value: vectorColour
            }
            this.factionMaterial.visible = true;
        }
        if (this.factionMesh.material instanceof Array) {
            this.factionMesh.material.forEach(material => material.dispose());
        } else {
            this.factionMesh.material.dispose();
        }
        this.factionMesh.material = this.factionMaterial;
    }

    public updateFactionSize (size: number) {
        console.log(this.factionSize);
        this.factionMesh.scale.set(size, size, size);
    }
    //#endpro

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
        //#pro
        this.factionMesh.geometry.dispose();
        if (this.factionMaterial instanceof Array) {
            this.factionMaterial.forEach(material => material.dispose());
        } else {
            this.factionMaterial.dispose();
        }
        this.factionMesh.removeFromParent();
        //#endpro

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