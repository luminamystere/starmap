import Star from "../components/Star.js";
import Button from "./Button.js";
import Component from "./Component.js";
import Label from "./Label.js";
import Panel from "./Panel.js";
import SelectInput from "./SelectInput.js";
import TextArea from "./TextArea.js";
import TextInput from "./TextInput.js";

export enum StarPanelClasses {
    Main = "starpanel",
    Label = "starpanel-label",
    Name = "starpanel-input-name",
    Description = "starpanel-input-description",
    Faction = "starpanel-input-faction",
    Delete = "starpanel-input-delete",
}

export default class StarPanel extends Panel {

    public readonly nameLabel = new Label("starName")
        .addClass(StarPanelClasses.Label)
        .setText("Name:")
        .appendTo(this.content);

    public readonly starName = new TextInput()
        .addClass(StarPanelClasses.Name)
        .setInputText(this.star.name)
        .setId("starName")
        .setMaxLength(30)
        .addChangeListener(input => this.star.name = input.element.value)
        .appendTo(this.content);

    public readonly descriptionLabel = new Label("starDescription")
        .addClass(StarPanelClasses.Label)
        .setText("Description:")
        .appendTo(this.content);

    public readonly starDescription = new TextArea()
        .addClass(StarPanelClasses.Description)
        .setInputText(this.star.description)
        .setId("starDescription")
        .appendTo(this.content);

    public readonly factionLabel = new Label("starFaction")
        .addClass(StarPanelClasses.Label)
        .setText("Faction:")
        .appendTo(this.content);

    public readonly factionSelect = new SelectInput()
        .addClass(StarPanelClasses.Faction)
        .setId("starFaction")
        .appendTo(this.content);

    public readonly deleteButton = new Button()
        .addClass(StarPanelClasses.Delete)
        .setText("DELETE")
        .addEventListener("click", () => this.deleteStar())
        .appendTo(this.content);

    public constructor (public readonly star: Star) {
        super();
        this.title.element.textContent = star.name;
        this.element.setAttribute("id", "starPanel");
        this.addClass(StarPanelClasses.Main);

        this.factionSelect.addEntry("test faction 01");
        this.factionSelect.addEntry("test faction 02");
        this.factionSelect.addEntry("test faction 03");
    }

    public deleteStar () {
        this.star.delete();
        this.remove();
    }
}