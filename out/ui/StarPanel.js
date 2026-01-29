import Button from "./Button.js";
import ColourInput from "./ColourInput.js";
import Label from "./Label.js";
import Panel, { PanelClasses } from "./Panel.js";
import TextArea from "./TextArea.js";
import TextInput from "./TextInput.js";
export var StarPanelClasses;
(function (StarPanelClasses) {
    StarPanelClasses["Main"] = "starpanel";
    StarPanelClasses["Label"] = "starpanel-label";
    StarPanelClasses["Name"] = "starpanel-input-name";
    StarPanelClasses["Description"] = "starpanel-input-description";
    StarPanelClasses["Faction"] = "starpanel-input-faction";
    StarPanelClasses["FactionSize"] = "starpanel-input-factionsize";
    StarPanelClasses["Colour"] = "starpanel-input-colour";
})(StarPanelClasses || (StarPanelClasses = {}));
export default class StarPanel extends Panel {
    constructor(star) {
        super();
        this.star = star;
        this.nameLabel = new Label("starName")
            .addClass(StarPanelClasses.Label)
            .setText("Name:")
            .appendTo(this.content);
        this.starName = new TextInput()
            .addClass(StarPanelClasses.Name)
            .setInputText(this.star.name)
            .setId("starName")
            .setMaxLength(128)
            .addChangeListener(input => this.star.name = input.element.value)
            .appendTo(this.content);
        this.descriptionLabel = new Label("starDescription")
            .addClass(StarPanelClasses.Label)
            .setText("Description:")
            .appendTo(this.content);
        this.starDescription = new TextArea()
            .addClass(StarPanelClasses.Description)
            .addChangeListener(input => this.star.description = input.element.value)
            .setInputText(this.star.description)
            .setId("starDescription")
            .appendTo(this.content);
        this.colourLabel = new Label("starColour")
            .addClass(StarPanelClasses.Label)
            .setText("Colour:")
            .appendTo(this.content);
        this.starColour = new ColourInput()
            .addClass(StarPanelClasses.Colour)
            .setInputColour(this.star.starColour)
            .setId("starColour")
            .addChangeListener(input => this.star.starColour = input.element.value)
            .appendTo(this.content);
        this.deleteButton = new Button()
            .addClass(PanelClasses.Wide)
            .setText("DELETE")
            .addEventListener("click", () => this.deleteStar())
            .appendTo(this.footer);
        this.title.element.textContent = "Star";
        this.element.setAttribute("id", "starPanel");
        this.addClass(StarPanelClasses.Main);
    }
    deleteStar() {
        this.star.delete();
        this.remove();
    }
}
