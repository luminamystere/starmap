import Component from "./Component.js";
export default class CheckboxInput extends Component {
    constructor() {
        super("input");
        this.element.type = "checkbox";
    }
    setChecked(checked) {
        this.element.checked = checked;
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
