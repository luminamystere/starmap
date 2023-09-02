import Component from "./Component.js";

export default class ColourInput extends Component<"input"> {
    public constructor () {
        super("input");
        this.element.type = "color";
    }

    public setInputColour (colour: `#${string}`) {
        this.element.value = colour;
        return this;
    }

    public addChangeListener (handler: (input: this, event: InputEvent) => any) {
        this.addEventListener("change", handler as any);
        return this;
    }

    public removeChangeListener (handler: (input: this, event: InputEvent) => any) {
        this.removeEventListener("change", handler as any);
        return this;
    }
}