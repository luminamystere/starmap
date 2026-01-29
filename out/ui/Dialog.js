import Component from "./Component.js";
export var DialogClasses;
(function (DialogClasses) {
    DialogClasses["Main"] = "dialog";
    DialogClasses["Button"] = "dialog-button";
    DialogClasses["Label"] = "dialog-label";
})(DialogClasses || (DialogClasses = {}));
export default class Dialog extends Component {
    constructor(world) {
        super("dialog");
        this.world = world;
        this.addClass(DialogClasses.Main);
        this.onMouseDown = this.onMouseDown.bind(this);
        document.addEventListener("mousedown", this.onMouseDown);
    }
    remove() {
        document.removeEventListener("mousedown", this.onMouseDown);
        this.world.popup = false;
        this.element.close();
        super.remove();
    }
    onMouseDown(event) {
        const boundingBox = this.element.getBoundingClientRect();
        if (!(event.clientX >= boundingBox.left && event.clientX < boundingBox.right && event.clientY >= boundingBox.top && event.clientY < boundingBox.bottom)) {
            this.remove();
        }
    }
}
