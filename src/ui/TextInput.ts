import Component from "./Component.js";

export default class TextInput extends Component<"input"> {
    public constructor () {
        super("input");
        this.element.type = "text";
    }

    public setInputText (text: string) {
        this.element.value = text;
        return this;
    }

    public setMaxLength (length: number) {
        this.element.maxLength = length;
        return this;
    }

    public addChangeListener (handler: (input: this, event: InputEvent) => any) {
        this.addEventListener("input", handler as any);
        return this;
    }

    public removeChangeListener (handler: (input: this, event: InputEvent) => any) {
        this.removeEventListener("input", handler as any);
        return this;
    }
}