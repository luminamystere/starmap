import { Color } from "three";
import World from "../World.js";
import Faction from "../components/Faction.js";
import Button from "./Button.js";
import Component from "./Component.js";
import Panel from "./Panel.js";
import TextInput from "./TextInput.js";
import TextArea from "./TextArea.js";
import ColourInput from "./ColourInput.js";
import Label from "./Label.js";
import SelectInput from "./SelectInput.js";

export enum ProjectPanelClasses {
    Main = "projectpanel",
    Name = "projectpanel-name",
    Label = "projectpanel-label",
    Select = "projectpanel-select",
    Description = "projectpanel-description",
    FactionBox = "projectpanel-faction-box",
    Faction = "projectpanel-faction",
    FactionLabel = "projectpanel-faction-label",
    FactionButton = "projectpanel-faction-button",
    FactionName = "projectpanel-faction-name",
    FactionDesc = "projectpanel-faction-description",
    FactionColour = "projectpanel-faction-colour",
    FactionDelete = "projectpanel-faction-delete",
    BackgroundLabel = "projectpanel-background-label",
    Background = "projectpanel-background-select",
    Button = "projectpanel-button",
    ControlsGuide = "projectpanel-controls",
    ControlsHeading = "projectpanel-controls-heading",
    ControlsText = "projectpanel-controls-text",
}

export default class ProjectPanel extends Panel {

    public readonly newFaction = new Button()
        .addClass(ProjectPanelClasses.Button)
        .setText("Add Faction")
        .addEventListener("click", () => this.addFaction())
        .appendTo(this.content);

    public readonly factionBox = new Component("div")
        .addClass(ProjectPanelClasses.FactionBox)
        .appendTo(this.content);

    public readonly starpathColourLabel = new Label("starpathColour")
        .addClass(ProjectPanelClasses.Label)
        .setText("Select Starpath Colour")
        .appendTo(this.content);

    public readonly starpathColourSelect = new ColourInput()
        .addClass(ProjectPanelClasses.Select)
        .setInputColour(this.world.starpathColour)
        .setId("starpathColour")
        .addChangeListener(input => this.world.starpathColour = input.element.value as `#${string}`)
        .appendTo(this.content);

    public readonly backgroundLabel = new Label("background")
        .addClass(ProjectPanelClasses.Label)
        .setText("Select Background")
        .appendTo(this.content);

    public readonly backgroundSelect = new SelectInput()
        .addClass(ProjectPanelClasses.Select)
        .addChangeListener((event) => this.world.chooseBackground(event.element.value))
        .setId("background")
        .appendTo(this.content);

    public readonly controlsGuide = new Component("div")
        .addClass(ProjectPanelClasses.ControlsGuide)
        .appendTo(this.content);

    public readonly controlsHeading = new Component("h2")
        .addClass(ProjectPanelClasses.ControlsHeading)
        .setText("CONTROLS")
        .appendTo(this.controlsGuide);

    public readonly controlsText = new Component("p")
        .addClass(ProjectPanelClasses.ControlsText)
        .setText("WASD - Movement\nSpace - Fly Up\nShift - Fly Down\nLeft Click - Move Star (drag)\nMiddle Click - Delete Starpath\nRight Click - Place/Inspect Star")
        .appendTo(this.controlsGuide);

    // public readonly exportButton = new Button()
    //     .addClass(ProjectPanelClasses.Button)
    //     .setText("EXPORT")
    //     .addEventListener("click", () => this.exportData())
    //     .appendTo(this.footer);

    // public readonly importButton = new Button()
    //     .addClass(ProjectPanelClasses.Button)
    //     .setText("IMPORT")
    //     .addEventListener("click", () => this.importData())
    //     .appendTo(this.footer);



    public constructor (public readonly world: World) {
        super();
        this.element.setAttribute("id", "projectPanel");
        this.addClass(ProjectPanelClasses.Main);
        for (const i in this.world.factions) {
            this.displayFaction(world.factions[i]);
        }
        this.backgroundSelect.addEntry("None");
        for (const background of this.world.backgrounds) {
            this.backgroundSelect.addEntry(background.name);
        }
    }

    public addFaction () {
        console.log("add faction");
        const name = "faction no " + this.world.factions.length;
        const colour = new Color(0xffffff);
        colour.setHex(Math.random() * 0xffffff);
        const faction = new Faction(name, "Add Text Here!", colour);
        this.world.factions.push(faction);
        this.displayFaction(faction);
        this.world.saveLocalStorage();
    }

    public displayFaction (faction: Faction) {
        return new FactionEditor(faction, this.world).appendTo(this.factionBox);
    }

    public exportData () {
        console.log("export data");
    }

    public importData () {
        console.log("import data");
    }
}

class FactionEditor extends Component<"div"> {

    public readonly nameLabel = new Label("factionName")
        .addClass(ProjectPanelClasses.FactionLabel)
        .setText("Name:")
        .appendTo(this);

    public readonly factionName = new TextInput()
        .addClass(ProjectPanelClasses.FactionName)
        .setInputText(this.faction.name)
        .setId("factionName")
        .setMaxLength(30)
        .addChangeListener(input => this.faction.name = input.element.value)
        .appendTo(this);

    public readonly descLabel = new Label("factionDesc")
        .addClass(ProjectPanelClasses.FactionLabel)
        .setText("Description:")
        .appendTo(this);

    public readonly factionDescription = new TextArea()
        .addClass(ProjectPanelClasses.FactionDesc)
        .setInputText(this.faction.description)
        .setId("factionDesc")
        .addChangeListener(input => this.faction.description = input.element.value)
        .appendTo(this);

    public readonly colourLabel = new Label("factionColour")
        .addClass(ProjectPanelClasses.FactionLabel)
        .setText("Colour:")
        .appendTo(this);

    public readonly factionColour = new ColourInput()
        .addClass(ProjectPanelClasses.FactionColour)
        .setInputColour(this.faction.colour)
        .setId("factionColour")
        .addChangeListener(input => this.updateColour(input.element.value as `#${string}`))
        // .addChangeListener(input => this.faction.colour = input.element.value as `#${string}`)
        .appendTo(this);

    public readonly factionDelete = new Button()
        .addClass(ProjectPanelClasses.FactionDelete)
        .setText("DELETE")
        .addEventListener("click", () => this.deleteFaction())
        .appendTo(this);

    public constructor (public readonly faction: Faction, public readonly world: World) {
        super("div");
        this.addClass(ProjectPanelClasses.Faction);
    }

    public updateColour (colour: `#${string}`) {
        this.faction.colour = colour;
        for (const star of this.world.stars) {
            if (star.faction == this.faction) {
                star.updateFaction(this.faction.name);
            }
        }
    }

    public deleteFaction () {
        console.log("ouchies!");
        for (const star of this.world.stars) {
            if (star.faction == this.faction) {
                star.updateFaction("None");
            }
        }
        this.world.factions.filter(faction => faction !== this.faction);
        this.remove();
    }
}