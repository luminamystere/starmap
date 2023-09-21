import { Color } from "three";
import World from "../World.js";
import Faction from "../components/Faction.js";
import Button from "./Button.js";
import Component from "./Component.js";
import Panel, { PanelClasses } from "./Panel.js";
import TextInput from "./TextInput.js";
import TextArea from "./TextArea.js";
import ColourInput from "./ColourInput.js";
import Label from "./Label.js";
import SelectInput from "./SelectInput.js";
import Files from "../systems/Files.js";

export enum ProjectPanelClasses {
    Main = "projectpanel",
    Popup = "projectpanel-popup",
    PopupText = "projectpanel-popup-text",
    PopupButton = "projectpanel-popup-button",
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
    FakeButton = "projectpanel-fakebutton",
    HiddenButton = "projectpanel-hiddenbutton",
    ControlsGuide = "projectpanel-controls",
    ControlsHeading = "projectpanel-controls-heading",
    ControlsText = "projectpanel-controls-text",
}

export default class ProjectPanel extends Panel {

    public readonly projNameLabel = new Label("projectName")
        .addClass(ProjectPanelClasses.Label)
        .setText("Name: ")
        .appendTo(this.content);

    public readonly projName = new TextInput()
        .addClass(ProjectPanelClasses.Name)
        .setInputText(this.world.projectName)
        .setId("projectName")
        .setMaxLength(64)
        .addChangeListener(input => this.world.projectName = input.element.value)
        .appendTo(this.content);

    public readonly newFaction = new Button()
        .addClass(PanelClasses.Wide)
        .setText("Add Faction")
        .addEventListener("click", () => this.addFaction())
        .appendTo(this.content);

    public readonly factionBox = new Component("div")
        .addClass(ProjectPanelClasses.FactionBox)
        .appendTo(this.content);

    public readonly starpathColourLabel = new Label("starpathColour")
        .addClass(ProjectPanelClasses.Label)
        .setText("Default Starpath Colour:")
        .appendTo(this.content);

    public readonly starpathColourSelect = new ColourInput()
        .addClass(ProjectPanelClasses.Select)
        .setInputColour(this.world.starpathColour)
        .setId("starpathColour")
        .addChangeListener(input => this.world.starpathColour = input.element.value as `#${string}`)
        .appendTo(this.content);

    public readonly backgroundLabel = new Label("background")
        .addClass(ProjectPanelClasses.Label)
        .setText("Select Background:")
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
        .setText("WASD - Movement\nSpace - Fly Up\nShift - Fly Down\nLeft Click - Move Star (drag)\nCtrl + Left Click - Create Starpath (drag)\nMiddle Click - Delete Starpath\nRight Click - Place/Inspect Star")
        .appendTo(this.controlsGuide);


    public readonly newStarmapButton = new Button()
        .addClass(ProjectPanelClasses.Button)
        .setText("NEW")
        .addEventListener("click", () => this.newStarmap())
        .appendTo(this.footer);

    public readonly exportButton = new Button()
        .addClass(ProjectPanelClasses.Button)
        .setText("EXPORT")
        .addEventListener("click", () => Files.downloadString(
            `${this.world.projectName.replace(/\W+/g, "-")}.starmap`,
            this.world.serialiseJSON()
        ))
        .appendTo(this.footer);

    public readonly importButton = new Button("label")
        .setAttribute("for", "starmap_import")
        .addClass(ProjectPanelClasses.FakeButton)
        .setText("IMPORT")
        .appendTo(this.footer);

    public readonly importInput = new Component("input")
        .setId("starmap_import")
        .addClass(ProjectPanelClasses.HiddenButton)
        .setAttribute("type", "file")
        .setAttribute("accept", ".starmap")
        .addEventListener("change", async (importInput, event) => {
            const file = await Files.uploadStringFromEvent(event)
            if (file) {
                this.world.deserialiseJSON(file);
            }
        })
        .appendTo(this.importButton);



    public constructor (public readonly world: World) {
        super();
        this.title.element.textContent = "Project";
        this.element.setAttribute("id", "projectPanel");
        this.addClass(ProjectPanelClasses.Main);
        for (const faction of this.world.factions) {
            this.displayFaction(faction);
        }
        this.backgroundSelect.addEntry("None");
        for (const background of this.world.backgrounds) {
            this.backgroundSelect.addEntry(background.name);
        }
    }

    public addFaction () {
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

    public newStarmap () {
        const popup = new PopupPanel(this.world);
        popup.appendTo(this);
        popup.element.showModal();

    }

    public refreshPanel () {
        while (this.factionBox.element.lastElementChild) {
            this.factionBox.element.removeChild(this.factionBox.element.lastElementChild);
        }
        for (const faction of this.world.factions) {
            this.displayFaction(faction);
        }
        this.projName.setInputText(this.world.projectName);
        this.starpathColourSelect.setInputColour(this.world.starpathColour);
    }
}

class PopupPanel extends Component<"dialog"> {

    public readonly warning = new Component("p")
        .addClass(ProjectPanelClasses.PopupText)
        .append(new Component("b").setText("Warning!"))
        .addText(" Creating a new starmap will clear the existing starmap. ")
        .appendTo(this)

    public readonly exportbutton = new Button()
        .addClass(ProjectPanelClasses.PopupButton)
        .addClass(PanelClasses.Wide)
        .setText("Export Starmap")
        .addEventListener("click", () => Files.downloadString(
            `${this.world.projectName.replace(/\W+/g, "-")}.starmap`,
            this.world.serialiseJSON()
        ))
        .appendTo(this);

    public readonly cancelButton = new Button()
        .addClass(ProjectPanelClasses.PopupButton)
        .setText("Cancel")
        .addEventListener("click", () => this.remove())
        .appendTo(this);

    public readonly okButton = new Button()
        .addClass(ProjectPanelClasses.PopupButton)
        .setText("OK")
        .addEventListener("click", () => this.resetWorld())
        .appendTo(this);

    public constructor (public readonly world: World) {
        super("dialog");
        this.addClass(ProjectPanelClasses.Popup);
    }

    public resetWorld () {
        this.world.resetWorld();
        this.world.projectPanel?.refreshPanel();
        this.remove();
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
        .setMaxLength(256)
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
        .addClass(PanelClasses.Wide)
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
        this.world.saveLocalStorage();
    }

    public deleteFaction () {
        for (const star of this.world.stars) {
            if (star.faction == this.faction) {
                star.updateFaction("None");
            }
        }
        this.world.factions = this.world.factions.filter(faction => faction !== this.faction);
        this.world.saveLocalStorage();
        this.remove();
    }
}