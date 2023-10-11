import World from "../World.js";
import Component from "./Component.js";

export enum DialogClasses {
    Main = "dialog",
    Button = "dialog-button",
    Label = "dialog-label",
}

export default class Dialog extends Component<"dialog"> {
    public constructor (public readonly world: World) {
        super("dialog");
        this.addClass(DialogClasses.Main);
        this.onMouseDown = this.onMouseDown.bind(this);
        document.addEventListener("mousedown", this.onMouseDown);
    }

    public override remove () {
        document.removeEventListener("mousedown", this.onMouseDown);
        this.world.popup = false;
        this.element.close();
        super.remove();
    }

    private onMouseDown (event: MouseEvent) {
        const boundingBox = this.element.getBoundingClientRect();

        if (!(event.clientX >= boundingBox.left && event.clientX < boundingBox.right && event.clientY >= boundingBox.top && event.clientY < boundingBox.bottom)) {
            this.remove();
        }
    }
}