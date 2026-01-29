import Component from "./Component.js";
export default class SelectInput extends Component {
    constructor() {
        super("select");
    }
    addEntry(entry, selected) {
        this.element.options.add(new Option(entry, entry, undefined, selected));
        return this;
    }
    addChangeListener(handler) {
        this.addEventListener("change", handler);
        return this;
    }
}
