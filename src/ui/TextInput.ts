import Component from "./Component.js";

export default class TextInput extends Component<"input"> {
    public constructor () {
        super("input");
        this.element.type = "text";
    }

    public setText (text: string) {
        this.element.value = text;
        return this;
    }
}