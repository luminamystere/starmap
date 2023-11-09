import Component from "./Component.js";

export default class Label extends Component<"label"> {
    public constructor (forId?: string) {
        super("label");
        if (forId) {
            this.element.htmlFor = forId;
        }
    }
}