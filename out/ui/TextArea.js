import Component from "./Component.js";
export default class TextArea extends Component {
    constructor() {
        super("textarea");
    }
    setInputText(text) {
        this.element.value = text;
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
