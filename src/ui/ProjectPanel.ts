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
import Dialog from "./Dialog.js";
import CheckboxInput from "./CheckboxInput.js";
import Store from "../utility/Store.js";
import RangeInput from "./RangeInput.js";
import InputInput from "./InputInput.js";

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
    OptionsInput = "projectpanel-options-input",
    OptionsMenu = "projectpanel-options",
    OptionsContainer = "projectpanel-options-container",
    OptionsLabel = "projectpanel-options-label",
    OptionsHeading = "projectpanel-options-heading",
    OptionsCheck = "projectpanel-options-check",
    OptionsButtonsContainer = "projectpanel-options-buttoncontainer",
    OptionsButtons = "projectpanel-options-button",
    OptionsRange = "projectpanel-options-range",
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

    public readonly optionsButton = new Button()
        .addClass(PanelClasses.FooterWide)
        .setText("OPTIONS")
        .addEventListener("click", () => this.openOptionsPanel())
        .appendTo(this.footer);



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

    public openOptionsPanel () {
        const options = new OptionsMenu()
        options.appendTo(this);
        options.element.showModal();
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

class PopupPanel extends Dialog {

    public readonly warning = new Component("p")
        .addClass(ProjectPanelClasses.PopupText)
        .append(new Component("b").setText("Warning!"))
        .addText(" Creating a new starmap will clear the existing starmap. ")
        .appendTo(this);

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
        super();
        this.addClass(ProjectPanelClasses.Popup);
    }

    public resetWorld () {
        this.world.resetWorld();
        this.world.projectPanel?.refreshPanel();
        this.remove();
    }
}

class OptionsMenu extends Dialog {

    public readonly optionsContainer = new Component("div")
        .addClass(PanelClasses.Wide)
        .appendTo(this);

    public readonly buttonContainer = new Component("div")
        .addClass(ProjectPanelClasses.OptionsButtonsContainer)
        .appendTo(this);

    public readonly resetButton = new Button()
        .addClass(ProjectPanelClasses.OptionsButtons)
        .setText("Reset to Default")
        .addEventListener("click", () => this.resetToDefault())
        .appendTo(this.buttonContainer);

    public readonly closeButton = new Button()
        .addClass(ProjectPanelClasses.OptionsButtons)
        .setText("Close")
        .addEventListener("click", () => this.remove())
        .appendTo(this.buttonContainer);

    public constructor () {
        super();
        this.addClass(ProjectPanelClasses.OptionsMenu);
        this.appendOptions();
    }

    public resetToDefault () {
        for (var i = localStorage.length - 1; i >= 0; i--) {
            const property = localStorage.key(i)
            if ((property) && property != "save") {
                localStorage.removeItem(property);
            }
        }
        this.optionsContainer.element.firstChild?.remove();
        this.appendOptions();
    }

    public appendOptions () {
        return new Options().appendTo(this.optionsContainer);
    }
}

class Options extends Component<"div"> {
    public readonly mouseSettingsLabel = new Label()
        .addClass(ProjectPanelClasses.OptionsHeading)
        .addClass(PanelClasses.Wide)
        .setText("Mouse Settings")
        .appendTo(this);

    public readonly invertXLabel = new Label("invertX")
        .addClass(ProjectPanelClasses.Label)
        .setText("Invert X: ")
        .appendTo(this);

    public readonly invertX = new CheckboxInput()
        .addClass(ProjectPanelClasses.OptionsCheck)
        .setId("invertX")
        .setChecked(Store.invertX || false)
        .addChangeListener(input => Store.invertX = input.element.checked)
        .appendTo(this)

    public readonly invertYLabel = new Label("invertY")
        .addClass(ProjectPanelClasses.Label)
        .setText("Invert Y: ")
        .appendTo(this);

    public readonly invertY = new CheckboxInput()
        .addClass(ProjectPanelClasses.OptionsCheck)
        .setId("invertY")
        .setChecked(Store.invertY || false)
        .addChangeListener(input => Store.invertY = input.element.checked)
        .appendTo(this);

    public readonly sensitivityLabel = new Label("sensitivity")
        .addClass(ProjectPanelClasses.Label)
        .setText("Mouse Sensitivity:")
        .appendTo(this);

    public readonly sensitivityInput = new RangeInput(0, 1, 0.01)
        .addClass(ProjectPanelClasses.OptionsRange)
        .setId("sensitivity")
        .setValue(Store.sensitivity ?? 0.5)
        .addChangeListener(input => Store.sensitivity = input.element.valueAsNumber)
        .appendTo(this);

    public readonly keybindLabel = new Label()
        .addClass(ProjectPanelClasses.OptionsHeading)
        .addClass(PanelClasses.Wide)
        .setText("Keybindings")
        .appendTo(this);

    public readonly forwardLabel = new Label("forwardBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Forward:")
        .appendTo(this);

    public readonly forwardBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.forwardKey)
        .addChangeListener(input => Store.forwardKey = input.currentInput)
        .appendTo(this);

    public readonly backLabel = new Label("backBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Back:")
        .appendTo(this);

    public readonly backBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.backKey)
        .addChangeListener(input => Store.backKey = input.currentInput)
        .appendTo(this);

    public readonly leftLabel = new Label("leftBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Left:")
        .appendTo(this);

    public readonly leftBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.leftKey)
        .addChangeListener(input => Store.leftKey = input.currentInput)
        .appendTo(this);

    public readonly rightLabel = new Label("rightBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Right:")
        .appendTo(this);

    public readonly rightBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.rightKey)
        .addChangeListener(input => Store.rightKey = input.currentInput)
        .appendTo(this);

    public readonly upLabel = new Label("upBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Up:")
        .appendTo(this);

    public readonly upBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.upKey)
        .addChangeListener(input => Store.upKey = input.currentInput)
        .appendTo(this);

    public readonly downLabel = new Label("downBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Down:")
        .appendTo(this);

    public readonly downBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.downKey)
        .addChangeListener(input => Store.downKey = input.currentInput)
        .appendTo(this);

    public readonly speedUpLabel = new Label("speedUpBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Speed Up:")
        .appendTo(this);

    public readonly speedUpBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.inputSpeedUp)
        .addChangeListener(input => Store.inputSpeedUp = input.currentInput)
        .appendTo(this);

    public readonly speedDownLabel = new Label("speedDownBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Slow Down:")
        .appendTo(this);

    public readonly speedDownBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.inputSpeedDown)
        .addChangeListener(input => Store.inputSpeedDown = input.currentInput)
        .appendTo(this);

    public readonly cursorCloserLabel = new Label("cursorCloserBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Held Object Closer:")
        .appendTo(this);

    public readonly cursorCloserBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.cursorCloser)
        .addChangeListener(input => Store.cursorCloser = input.currentInput)
        .appendTo(this);

    public readonly cursorFurtherLabel = new Label("cursorFurtherBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Held Object Further:")
        .appendTo(this);

    public readonly cursorFurtherBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.cursorFurther)
        .addChangeListener(input => Store.cursorFurther = input.currentInput)
        .appendTo(this);

    public readonly moveStarLabel = new Label("moveStarBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Move Star (held):")
        .appendTo(this);

    public readonly moveStarBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.moveStar)
        .addChangeListener(input => Store.moveStar = input.currentInput)
        .appendTo(this);

    public readonly createStarpathLabel = new Label("createStarpathBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Create Starpath:")
        .appendTo(this);

    public readonly createStarpathBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.createStarpath)
        .addChangeListener(input => Store.createStarpath = input.currentInput)
        .appendTo(this);

    public readonly openStarPanelLabel = new Label("openStarPanelBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Open Star Panel:")
        .appendTo(this);

    public readonly openStarPanelBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.openStarPanel)
        .addChangeListener(input => Store.openStarPanel = input.currentInput)
        .appendTo(this);

    public readonly openStarpathPanelLabel = new Label("openStarpathPanelBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Open Starpath Panel:")
        .appendTo(this);

    public readonly openStarpathPanelBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.openStarpathPanel)
        .addChangeListener(input => Store.openStarpathPanel = input.currentInput)
        .appendTo(this);

    public readonly createStarLabel = new Label("createStarBind")
        .addClass(ProjectPanelClasses.Label)
        .addClass(ProjectPanelClasses.OptionsLabel)
        .setText("Create Star:")
        .appendTo(this);

    public readonly createStarBind = new InputInput()
        .addClass(ProjectPanelClasses.OptionsInput)
        .setInput(Store.createStar)
        .addChangeListener(input => Store.createStar = input.currentInput)
        .appendTo(this);

    public constructor () {
        super("div");
        this.addClass(ProjectPanelClasses.OptionsContainer);
        this.addClass(PanelClasses.Wide);
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