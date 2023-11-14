import StarPath from "../components/StarPath.js";
import Button from "./Button.js";
import ColourInput from "./ColourInput.js";
import Label from "./Label.js";
import Panel, { PanelClasses } from "./Panel.js";
import TextArea from "./TextArea.js";
import TextInput from "./TextInput.js";

export enum StarPathPanelClasses {
    Main = "starpathpanel",
    Label = "starpathpanel-label",
    Name = "starpathpanel-input-name",
    Description = "starpathpanel-input-description",
    Colour = "starpathpanel-input-colour",
    Button = "starpathpanel-input-button",
}

export default class StarPathPanel extends Panel {

    public readonly nameLabel = new Label("starpathName")
        .addClass(StarPathPanelClasses.Label)
        .setText("Name: ")
        .appendTo(this.content);

    public readonly starpathName = new TextInput()
        .addClass(StarPathPanelClasses.Name)
        .setInputText(this.starpath.starpathName)
        .setId("starpathName")
        .setMaxLength(128)
        .addChangeListener(input => this.starpath.starpathName = input.element.value)
        .appendTo(this.content);

    public readonly descriptionLabel = new Label("starpathDescription")
        .addClass(StarPathPanelClasses.Description)
        .setText("Description: ")
        .appendTo(this.content);

    public readonly starpathDescription = new TextArea()
        .addClass(StarPathPanelClasses.Label)
        .addChangeListener(input => this.starpath.description = input.element.value)
        .setInputText(this.starpath.description)
        .setId("starpathDescription")
        .appendTo(this.content);

    public readonly starpathColourLabel = new Label("starpathColour")
        .addClass(StarPathPanelClasses.Label)
        .setText("Colour:")
        .appendTo(this.content);

    public readonly starpathColour = new ColourInput()
        .addClass(StarPathPanelClasses.Colour)
        .setInputColour(this.starpath.starpathColour)
        .setId("starpathColour")
        .addChangeListener(input => this.starpath.starpathColour = input.element.value as `#${string}`)
        .appendTo(this.content);

    public readonly deleteButton = new Button()
        .addClass(PanelClasses.Wide)
        .setText("DELETE")
        .addEventListener("click", () => this.deleteStarpath())
        .appendTo(this.footer);

    public constructor (public readonly starpath: StarPath) {
        super();
        this.title.element.textContent = "Starpath";
        this.element.setAttribute("id", "starpathPanel");
        this.addClass(StarPathPanelClasses.Main);
    }

    public deleteStarpath () {
        this.starpath.deleteStarPath();
        this.remove();
    }
}