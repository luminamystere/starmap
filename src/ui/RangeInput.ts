import Component from "./Component.js";

export default class RangeInput extends Component<"input"> {
    public constructor (min: number, max: number, step: number) {
        super("input");
        this.element.type = "range";
        this.element.min = min.toString();
        this.element.max = max.toString();
        this.element.step = step.toString();
    }

    public setValue (value: number) {
        this.element.valueAsNumber = value;
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