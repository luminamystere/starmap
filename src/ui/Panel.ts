import Button from "./Button.js";
import Component from "./Component.js";

export enum PanelClasses {
    Main = "panel",
    Header = "panel-header",
    Title = "panel-header-title",
    CloseButton = "panel-header-closeButton"
}

export default class Panel extends Component<"aside"> {

    public readonly header = new Component("header")
        .addClass(PanelClasses.Header)
        .appendTo(this);

    public readonly title = new Component("h1")
        .addClass(PanelClasses.Title)
        .appendTo(this.header);

    public readonly closeButton = new Button()
        .addClass(PanelClasses.CloseButton)
        .setText("Close")
        .addEventListener("click", () => this.remove())
        .appendTo(this.header);

    public constructor () {
        super("aside");
        this.addClass(PanelClasses.Main);
        document.documentElement.classList.add("pointerlock-disabled");
    }

    public override remove (): void {
        document.documentElement.classList.remove("pointerlock-disabled");
        this.emitEvent("closePanel");
        super.remove();
    }
}