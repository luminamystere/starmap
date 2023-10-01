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
    }

    public override remove () {
        this.world.popup = false;
        super.remove();
    }
}