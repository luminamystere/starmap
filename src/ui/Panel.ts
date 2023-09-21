import Button from "./Button.js";
import Component from "./Component.js";

export enum PanelClasses {
    Main = "panel",
    Header = "panel-header",
    Title = "panel-header-title",
    CloseButton = "panel-header-closeButton",
    Wrapper = "panel-wrapper",
    Content = "panel-content",
    Wide = "panel-content-wide",
    Footer = "panel-footer",
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
        .setText("X")
        .addEventListener("click", () => this.remove())
        .appendTo(this.header);

    public readonly contentWrapper = new Component("div")
        .addClass(PanelClasses.Wrapper)
        .appendTo(this);

    public readonly content = new Component("div")
        .addClass(PanelClasses.Content)
        .appendTo(this.contentWrapper);

    public readonly footer = new Component("footer")
        .addClass(PanelClasses.Footer)
        .appendTo(this.contentWrapper);

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