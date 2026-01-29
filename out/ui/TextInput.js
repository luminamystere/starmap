import Component from "./Component.js";
export default class TextInput extends Component {
    constructor() {
        super("input");
        this.element.type = "text";
    }
    setInputText(text) {
        this.element.value = text;
        return this;
    }
    setMaxLength(length) {
        this.element.maxLength = length;
        return this;
    }
    addChangeListener(handler) {
        this.addEventListener("input", handler);
        return this;
    }
    removeChangeListener(handler) {
        this.removeEventListener("input", handler);
        return this;
    }
}
