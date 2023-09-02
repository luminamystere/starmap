import { Color } from "three";

export default class Faction {

    private _name: string;
    public get name () {
        return this._name;
    }
    public set name (input: string) {
        this._name = input;
    }
    public _description: string;
    public get description () {
        return this._description
    }
    public set description (input: string) {
        this._description = input;
    }
    public _colour: Color;
    public get colour () {
        return `#${this._colour.getHexString()}`;
    }
    public set colour (input: `#${string}`) {
        this._colour = new Color(input);
    }

    public constructor (name: string, description: string, colour: Color) {
        this._name = name;
        this._description = description;
        this._colour = colour;
    }
}