import { Color, Object3D, Vector3 } from "three";
import Collider from "./Collider.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import Math2 from "../utility/Math2.js";
export default class Star {
    get starColour() {
        return `#${this._colour.getHexString()}`;
    }
    set starColour(input) {
        this._colour = new Color(input);
        this.updateColour();
    }
    get name() {
        return this._name;
    }
    set name(input) {
        this._name = input;
        this.updateLabel();
    }
    get description() {
        return this._description;
    }
    set description(input) {
        this._description = input;
    }
    get factionSize() {
        return this._factionSize;
    }
    set factionSize(input) {
        this._factionSize = input;
    }
    constructor(name, description, colour, position, scene, world) {
        this.starPaths = [];
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
        this._factionSize = 4;
        this.updateLabel();
        this.updatePosition();
        this.unHoverStar();
        this.updateColour();
    }
    createStar() {
        this.world.starMesh.setMatrixAt(this.index, this.starHolder.matrix);
        this.world.starMesh.instanceMatrix.needsUpdate = true;
        this.world.starMesh.computeBoundingSphere();
        this.world.starMesh.count += 1;
    }
    createCollider(scene) {
        const collider = new Collider(this);
        this.collider = collider;
        scene.add(this.collider);
        return collider;
    }
    get currentCollider() {
        return this.collider;
    }
    createLabel() {
        const container = document.createElement('div');
        const starDiv = document.createElement('div');
        container.append(starDiv);
        starDiv.className = 'label';
        starDiv.textContent = this._name.toString();
        this.starLabel = new CSS2DObject(container);
        this.starLabel.element.firstElementChild.style.transform = `scale(1)`;
        this.starLabel.position.set(0, 0.5, 0);
        this.starHolder.add(this.starLabel);
    }
    updateLabel() {
        if (!this.starLabel && this._name !== "") {
            this.createLabel();
            this.updateLabelScale(this.world._camera.getWorldPosition(new Vector3));
        }
        else if (this.starLabel && this._name !== "") {
            this.starLabel.element.firstElementChild.textContent = this._name;
            this.updateLabelScale(this.world._camera.getWorldPosition(new Vector3));
        }
        else if (this.starLabel && this._name == "") {
            while (this.starLabel.element.lastElementChild) {
                this.starLabel.element.removeChild(this.starLabel.element.lastElementChild);
            }
            this.starLabel.removeFromParent();
            delete this.starLabel;
        }
        this.world.saveLocalStorage();
    }
    updateLabelScale(position) {
        if (!this.starLabel) {
            return;
        }
        const distance = new Vector3().subVectors(this.position, position).length();
        const distanceScaleValue = 50;
        const minSize = 0.05;
        const maxSize = 0.4;
        const scale = Math2.clamp(minSize, maxSize, minSize + (1 - (distance / distanceScaleValue)) * (maxSize - minSize));
        this.starLabel.element.firstElementChild.style.transform = `scale(${scale})`;
        this.starLabel.element.firstElementChild.style.opacity = `${1 - (distance / distanceScaleValue)}`;
    }
    addStarPath(path) {
        this.starPaths.push(path);
    }
    updatePosition() {
        this.starHolder.position.set(this.position.x, this.position.y, this.position.z);
        this.starHolder.updateMatrix();
        this.world.starMesh.setMatrixAt(this.index, this.starHolder.matrix);
        this.world.starMesh.instanceMatrix.needsUpdate = true;
        this.world.starMesh.computeBoundingSphere();
        this.collider.position.set(this.position.x, this.position.y, this.position.z);
    }
    hoverStar() {
        if (this.collider.material instanceof Array) {
            this.collider.material.forEach(material => {
                material.opacity = 0.4;
                material.visible = true;
            });
        }
        else {
            this.collider.material.opacity = 0.4;
            this.collider.material.visible = true;
        }
    }
    unHoverStar() {
        if (this.collider.material instanceof Array) {
            this.collider.material.forEach(material => {
                material.opacity = 0;
                material.visible = false;
            });
        }
        else {
            this.collider.material.opacity = 0;
            this.collider.material.visible = false;
            ;
        }
    }
    updateColour() {
        this.world.starMesh.setColorAt(this.index, this._colour);
        if (this.world.starMesh.instanceColor) {
            this.world.starMesh.instanceColor.needsUpdate = true;
        }
    }
    delete() {
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
            }
            else {
                this.collider.material.dispose();
            }
            this.collider.removeFromParent();
        }
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
