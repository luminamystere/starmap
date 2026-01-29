import Component from "./Component.js";
export default class Label extends Component {
    constructor(forId) {
        super("label");
        if (forId) {
            this.element.htmlFor = forId;
        }
    }
}
