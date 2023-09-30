import Component from "./Component.js";

export enum DialogClasses {
    Main = "dialog",
    Button = "dialog-button",
    Label = "dialog-label",
}

export default class Dialog extends Component<"dialog"> {
    public constructor () {
        super("dialog");
        this.addClass(DialogClasses.Main);
    }
}