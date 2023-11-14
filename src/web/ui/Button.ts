import Component from "./Component.js";

export enum ButtonClass {
    Button = "button",
}

export default class Button<TAG_NAME extends keyof HTMLElementTagNameMap = "button"> extends Component<TAG_NAME> {

    public constructor (tagName: TAG_NAME = "button" as TAG_NAME) {
        super(tagName);
        this.addClass(ButtonClass.Button);
    }
}