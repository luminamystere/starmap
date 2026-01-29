import Button from "./Button.js";
import Component from "./Component.js";
export var PanelClasses;
(function (PanelClasses) {
    PanelClasses["Main"] = "panel";
    PanelClasses["Header"] = "panel-header";
    PanelClasses["Title"] = "panel-header-title";
    PanelClasses["CloseButton"] = "panel-header-closeButton";
    PanelClasses["Wrapper"] = "panel-wrapper";
    PanelClasses["Content"] = "panel-content";
    PanelClasses["Wide"] = "panel-content-wide";
    PanelClasses["ThreeWide"] = "panel-content-threewide";
    PanelClasses["Footer"] = "panel-footer";
    PanelClasses["FooterWide"] = "panel-footer-wide";
})(PanelClasses || (PanelClasses = {}));
export default class Panel extends Component {
    constructor() {
        super("aside");
        this.header = new Component("header")
            .addClass(PanelClasses.Header)
            .appendTo(this);
        this.title = new Component("h1")
            .addClass(PanelClasses.Title)
            .appendTo(this.header);
        this.closeButton = new Button()
            .addClass(PanelClasses.CloseButton)
            .setText("X")
            .addEventListener("click", () => this.remove())
            .appendTo(this.header);
        this.contentWrapper = new Component("div")
            .addClass(PanelClasses.Wrapper)
            .appendTo(this);
        this.content = new Component("div")
            .addClass(PanelClasses.Content)
            .appendTo(this.contentWrapper);
        this.footer = new Component("footer")
            .addClass(PanelClasses.Footer)
            .appendTo(this.contentWrapper);
        this.openedAt = Date.now();
        this.addClass(PanelClasses.Main);
        document.documentElement.classList.add("pointerlock-disabled");
    }
    remove() {
        document.documentElement.classList.remove("pointerlock-disabled");
        this.emitEvent("closePanel");
        super.remove();
    }
}
