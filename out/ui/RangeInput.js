import Component from "./Component.js";
export default class RangeInput extends Component {
    constructor(min, max, step) {
        super("input");
        this.element.type = "range";
        this.element.min = min.toString();
        this.element.max = max.toString();
        this.element.step = step.toString();
    }
    setValue(value) {
        this.element.valueAsNumber = value;
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
