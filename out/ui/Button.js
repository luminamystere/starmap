import Component from "./Component.js";
export var ButtonClass;
(function (ButtonClass) {
    ButtonClass["Button"] = "button";
})(ButtonClass || (ButtonClass = {}));
export default class Button extends Component {
    constructor(tagName = "button") {
        super(tagName);
        this.addClass(ButtonClass.Button);
    }
}
