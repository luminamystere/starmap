import Component from "./Component.js";

export default class CheckboxInput extends Component<"input"> {
    public constructor () {
        super("input");
        this.element.type = "checkbox";
    }

    public setChecked (checked: boolean) {
        this.element.checked = checked;
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