import Component from "./Component.js";
export default class ColourInput extends Component {
    constructor() {
        super("input");
        this.element.type = "color";
    }
    setInputColour(colour) {
        this.element.value = colour;
        return this;
    }
    addChangeListener(handler) {
        this.addEventListener("change", handler);
        return this;
    }
    removeChangeListener(handler) {
        this.removeEventListener("change", handler);
        return this;
    }
}
