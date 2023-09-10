import Component from "./Component.js";

export default class TextArea extends Component<"textarea"> {
    public constructor () {
        super("textarea");
    }

    public setInputText (text: string) {
        this.element.value = text;
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