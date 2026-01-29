import { Color } from "three";
export default class Faction {
    get name() {
        return this._name;
    }
    set name(input) {
        this._name = input;
    }
    get description() {
        return this._description;
    }
    set description(input) {
        this._description = input;
    }
    get colour() {
        return `#${this._colour.getHexString()}`;
    }
    set colour(input) {
        this._colour = new Color(input);
    }
    constructor(name, description, colour) {
        this._name = name;
        this._description = description;
        this._colour = colour;
    }
}
