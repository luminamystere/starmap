import Star from "../components/Star.js";
import Button from "./Button.js";
import ColourInput from "./ColourInput.js";
import Label from "./Label.js";
import Panel, { PanelClasses } from "./Panel.js";
import SelectInput from "./SelectInput.js";
import TextArea from "./TextArea.js";
import TextInput from "./TextInput.js";

export enum StarPanelClasses {
    Main = "starpanel",
    Label = "starpanel-label",
    Name = "starpanel-input-name",
    Description = "starpanel-input-description",
    Faction = "starpanel-input-faction",
    Colour = "starpanel-input-colour",
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
        .setMaxLength(128)
        .addChangeListener(input => this.star.name = input.element.value)
        .appendTo(this.content);

    public readonly descriptionLabel = new Label("starDescription")
        .addClass(StarPanelClasses.Label)
        .setText("Description:")
        .appendTo(this.content);

    public readonly starDescription = new TextArea()
        .addClass(StarPanelClasses.Description)
        .addChangeListener(input => this.star.description = input.element.value)
        .setInputText(this.star.description)
        .setId("starDescription")
        .appendTo(this.content);

    //#pro

    public readonly factionLabel = new Label("starFaction")
        .addClass(StarPanelClasses.Label)
        .setText("Faction:")
        .appendTo(this.content);

    public readonly factionSelect = new SelectInput()
        .addClass(StarPanelClasses.Faction)
        .addChangeListener((event) => this.updateFaction(event.element.value))
        .setId("starFaction")
        .appendTo(this.content);

    //#endpro

    public readonly colourLabel = new Label("starColour")
        .addClass(StarPanelClasses.Label)
        .setText("Colour:")
        .appendTo(this.content);

    public readonly starColour = new ColourInput()
        .addClass(StarPanelClasses.Colour)
        .setInputColour(this.star.starColour)
        .setId("starColour")
        .addChangeListener(input => this.star.starColour = input.element.value as `#${string}`)
        .appendTo(this.content);

    public readonly deleteButton = new Button()
        .addClass(PanelClasses.Wide)
        .setText("DELETE")
        .addEventListener("click", () => this.deleteStar())
        .appendTo(this.footer);

    public constructor (public readonly star: Star) {
        super();
        this.title.element.textContent = "Star";
        this.element.setAttribute("id", "starPanel");
        this.addClass(StarPanelClasses.Main);

        //#pro

        this.factionSelect.addEntry("None");
        for (const faction of star.world.factions) {
            if (faction == star.faction) {
                this.factionSelect.addEntry(faction.name, true);
            } else {
                this.factionSelect.addEntry(faction.name);
            }
        }

        //#endpro
    }

    public deleteStar () {
        this.star.delete();
        this.remove();
    }

    //#pro

    public updateFaction (input: string) {
        this.star.updateFaction(input);
        this.star.world.saveLocalStorage();
    }

    //#endpro
}