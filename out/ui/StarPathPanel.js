import Button from "./Button.js";
import ColourInput from "./ColourInput.js";
import Label from "./Label.js";
import Panel, { PanelClasses } from "./Panel.js";
import TextArea from "./TextArea.js";
import TextInput from "./TextInput.js";
export var StarPathPanelClasses;
(function (StarPathPanelClasses) {
    StarPathPanelClasses["Main"] = "starpathpanel";
    StarPathPanelClasses["Label"] = "starpathpanel-label";
    StarPathPanelClasses["Name"] = "starpathpanel-input-name";
    StarPathPanelClasses["Description"] = "starpathpanel-input-description";
    StarPathPanelClasses["Colour"] = "starpathpanel-input-colour";
    StarPathPanelClasses["Button"] = "starpathpanel-input-button";
})(StarPathPanelClasses || (StarPathPanelClasses = {}));
export default class StarPathPanel extends Panel {
    constructor(starpath) {
        super();
        this.starpath = starpath;
        this.nameLabel = new Label("starpathName")
            .addClass(StarPathPanelClasses.Label)
            .setText("Name: ")
            .appendTo(this.content);
        this.starpathName = new TextInput()
            .addClass(StarPathPanelClasses.Name)
            .setInputText(this.starpath.starpathName)
            .setId("starpathName")
            .setMaxLength(128)
            .addChangeListener(input => this.starpath.starpathName = input.element.value)
            .appendTo(this.content);
        this.descriptionLabel = new Label("starpathDescription")
            .addClass(StarPathPanelClasses.Description)
            .setText("Description: ")
            .appendTo(this.content);
        this.starpathDescription = new TextArea()
            .addClass(StarPathPanelClasses.Label)
            .addChangeListener(input => this.starpath.description = input.element.value)
            .setInputText(this.starpath.description)
            .setId("starpathDescription")
            .appendTo(this.content);
        this.starpathColourLabel = new Label("starpathColour")
            .addClass(StarPathPanelClasses.Label)
            .setText("Colour:")
            .appendTo(this.content);
        this.starpathColour = new ColourInput()
            .addClass(StarPathPanelClasses.Colour)
            .setInputColour(this.starpath.starpathColour)
            .setId("starpathColour")
            .addChangeListener(input => this.starpath.starpathColour = input.element.value)
            .appendTo(this.content);
        this.deleteButton = new Button()
            .addClass(PanelClasses.Wide)
            .setText("DELETE")
            .addEventListener("click", () => this.deleteStarpath())
            .appendTo(this.footer);
        this.title.element.textContent = "Starpath";
        this.element.setAttribute("id", "starpathPanel");
        this.addClass(StarPathPanelClasses.Main);
    }
    deleteStarpath() {
        this.starpath.deleteStarPath();
        this.remove();
    }
}
