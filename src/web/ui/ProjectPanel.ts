import { Color } from "three";
import World from "../World.js";
import Faction from "../components/Faction.js";
import Files from "../systems/Files.js";
import Store, { rebindableKeyDefinitions } from "../utility/Store.js";
import Button from "./Button.js";
import CheckboxInput from "./CheckboxInput.js";
import ColourInput from "./ColourInput.js";
import Component from "./Component.js";
import Dialog from "./Dialog.js";
import InputInput from "./InputInput.js";
import Label from "./Label.js";
import Panel, { PanelClasses } from "./Panel.js";
import RangeInput from "./RangeInput.js";
import SelectInput from "./SelectInput.js";
import TextArea from "./TextArea.js";
import TextInput from "./TextInput.js";

export enum ProjectPanelClasses {
    Main = "projectpanel",
    Popup = "projectpanel-popup",
    PopupText = "projectpanel-popup-text",
    PopupButton = "projectpanel-popup-button",
    Name = "projectpanel-name",
    Label = "projectpanel-label",
    Select = "projectpanel-select",
    Description = "projectpanel-description",
    FactionDialog = "projectpanel-faction-dialog",
    FactionContainer = "projectpanel-faction-container",
    FactionBox = "projectpanel-faction-box",
    Faction = "projectpanel-faction",
    FactionLabel = "projectpanel-faction-label",
    FactionsButton = "projectpanel-faction-button",
    FactionButton = "projectpanel-faction-dialog-button",
    FactionDetails = "projectpanel-faction-details",
    FactionSummary = "projectpanel-faction-summary",
    FactionName = "projectpanel-faction-name",
    FactionDesc = "projectpanel-faction-description",
    FactionColour = "projectpanel-faction-colour",
    FactionDelete = "projectpanel-faction-delete",
    BackgroundLabel = "projectpanel-background-label",
    Background = "projectpanel-background-select",
    ButtonContainer = "projectpanel-container",
    ButtonThreeWide = "projectpanel-container-wide",
    Button = "projectpanel-button",
    FakeButton = "projectpanel-fakebutton",
    HiddenButton = "projectpanel-hiddenbutton",
    ControlsGuide = "projectpanel-controls",
    ControlsHeading = "projectpanel-controls-heading",
    ControlsText = "projectpanel-controls-text",
    OptionsInput = "projectpanel-options-input",
    OptionsMenu = "projectpanel-options",
    OptionsContent = "projectpanel-options-content",
    OptionsContainer = "projectpanel-options-container",
    OptionsLabel = "projectpanel-options-label",
    OptionsHeading = "projectpanel-options-heading",
    OptionsCheck = "projectpanel-options-check",
    OptionsButtonsContainer = "projectpanel-options-buttoncontainer",
    OptionsKeybindsContainer = "projectpanel-options-keybindscontainer",
    OptionsButtons = "projectpanel-options-button",
    OptionsDefaultButton = "projectpanel-options-defaultbutton",
    OptionsRange = "projectpanel-options-range",
    FooterText = "projectpanel-footer-text"
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

    //#pro

    public readonly factionsButton = new Button()
        .addClass(ProjectPanelClasses.FactionsButton)
        .setText("Factions")
        .addEventListener("click", () => this.openFactions())
        .appendTo(this.content);

    //#endpro

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

    public readonly buttonContainer = new Component("div")
        .addClass(ProjectPanelClasses.ButtonContainer)
        .appendTo(this.footer);


    public readonly newStarmapButton = new Button()
        .addClass(ProjectPanelClasses.Button)
        .setText("NEW")
        .addEventListener("click", () => this.newStarmap())
        .appendTo(this.buttonContainer);

    public readonly exportButton = new Button()
        .addClass(ProjectPanelClasses.Button)
        .setText("EXPORT")
        .addEventListener("click", () => Files.downloadString(
            `${this.world.projectName.replace(/\W+/g, "-")}.starmap`,
            this.world.serialiseJSON()
        ))
        .appendTo(this.buttonContainer);

    public readonly importButton = new Button("label")
        .setAttribute("for", "starmap_import")
        .addClass(ProjectPanelClasses.FakeButton)
        .setText("IMPORT")
        .appendTo(this.buttonContainer);

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
        .addClass(ProjectPanelClasses.Button)
        .addClass(ProjectPanelClasses.ButtonThreeWide)
        .setText("OPTIONS")
        .addEventListener("click", () => this.openOptionsPanel())
        .appendTo(this.buttonContainer);

    // public readonly footerText = new Component("p")
    //     .addClass(ProjectPanelClasses.FooterText)
    //     .setText("Here's some text for the footer!")
    //     .appendTo(this.footer);



    public constructor (public readonly world: World) {
        super();
        this.title.element.textContent = "Project";
        this.element.setAttribute("id", "projectPanel");
        this.addClass(ProjectPanelClasses.Main);
        this.backgroundSelect.addEntry("None");
        for (const background of this.world.backgrounds) {
            this.backgroundSelect.addEntry(background.name);
        }
    }

    //#pro

    public openFactions () {
        const factionPopup = new FactionDialog(this.world);
        factionPopup.appendTo(this);
        factionPopup.element.showModal();
    }

    //#endpro

    public newStarmap () {
        const popup = new PopupPanel(this.world);
        popup.appendTo(this);
        popup.element.showModal();

    }

    public openOptionsPanel () {
        const options = new OptionsDialog(this.world)
        options.appendTo(this);
        options.element.showModal();
    }

    public refreshPanel () {
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

    public constructor (world: World) {
        super(world);
        this.addClass(ProjectPanelClasses.Popup);
        this.world.popup = true;
        this.element.addEventListener("cancel", (event) => {
            event.preventDefault();
        });
    }

    public resetWorld () {
        this.world.resetWorld();
        this.world.projectPanel?.refreshPanel();
        this.remove();
    }


}

class OptionsDialog extends Dialog {

    public readonly optionsContainer = new Component("div")
        .addClass(ProjectPanelClasses.OptionsContent)
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

    public constructor (world: World) {
        super(world);
        this.addClass(ProjectPanelClasses.OptionsMenu);
        this.appendOptions();
        this.world.popup = true;
        this.element.addEventListener("cancel", (event) => {
            event.preventDefault();
        });
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

    public readonly optionsDiv = new Component("div")
        .addClass(ProjectPanelClasses.OptionsKeybindsContainer)
        .appendTo(this);

    public constructor () {
        super("div");
        this.addClass(ProjectPanelClasses.OptionsContainer);
        this.addClass(PanelClasses.Wide);

        for (const [keybindId, translation] of Object.entries(rebindableKeyDefinitions) as [keyof typeof rebindableKeyDefinitions, string][]) {

            new Label(keybindId)
                .addClass(ProjectPanelClasses.Label)
                .addClass(ProjectPanelClasses.OptionsLabel)
                .addText(translation)
                .addText(":")
                .appendTo(this.optionsDiv);

            const input = new InputInput()
                .setId(keybindId)
                .addClass(ProjectPanelClasses.OptionsInput)
                .setInput(Store[keybindId])
                .addChangeListener(input => Store[keybindId] = input.currentInput)
                .appendTo(this.optionsDiv);

            new Button()
                .addClass(ProjectPanelClasses.OptionsDefaultButton)
                .addText("↺")
                .addEventListener("click", () => {
                    delete Store[keybindId];
                    input.setInput(Store[keybindId]);
                })
                .appendTo(this.optionsDiv);
        }
    }
}

//#pro

class FactionDialog extends Dialog {

    public readonly factionsContainer = new Component("div")
        .addClass(ProjectPanelClasses.FactionContainer)
        .appendTo(this);


    public readonly addFactionButton = new Button()
        .addClass(ProjectPanelClasses.FactionButton)
        .setText("Add Faction")
        .addEventListener("click", () => this.addFaction())
        .appendTo(this);

    public readonly closeButton = new Button()
        .addClass(ProjectPanelClasses.FactionButton)
        .setText("Close")
        .addEventListener("click", () => this.remove())
        .appendTo(this);

    public constructor (world: World) {
        super(world);
        this.addClass(ProjectPanelClasses.FactionDialog);
        this.world.popup = true;
        this.element.addEventListener("cancel", (event) => event.preventDefault());
        for (const faction of this.world.factions) {
            this.appendFaction(faction);
        }
    }

    private addFaction () {
        const name = "faction no " + this.world.factions.length;
        const colour = new Color(0xffffff);
        colour.setHex(Math.random() * 0xffffff);
        const faction = new Faction(name, "Add text here!", colour);
        this.world.factions.push(faction);
        this.appendFaction(faction);
    }

    private appendFaction (faction: Faction) {
        new FactionEditor(faction, this.world).appendTo(this.factionsContainer);
    }

    public refreshFactions () {

    }
}

class FactionEditor extends Component<"details"> {

    public readonly summary = new Component("summary")
        .addClass(ProjectPanelClasses.FactionSummary)
        .appendTo(this);

    public readonly label = new Component("span")
        .appendTo(this.summary);

    public readonly factionDelete = new Button()
        .addClass(ProjectPanelClasses.FactionDelete)
        .setText("DELETE")
        .addEventListener("click", () => this.deleteFaction())
        .appendTo(this.summary);

    public readonly contents = new Component("div")
        .addClass(ProjectPanelClasses.Faction)
        .appendTo(this);

    public readonly nameLabel = new Label("factionName")
        .addClass(ProjectPanelClasses.FactionLabel)
        .setText("Name:")
        .appendTo(this.contents);

    public readonly factionName = new TextInput()
        .addClass(ProjectPanelClasses.FactionName)
        .setInputText(this.faction.name)
        .setId("factionName")
        .setMaxLength(256)
        .addChangeListener(input => {
            this.faction.name = input.element.value;
            this.updateLabel(input.element.value);
        })
        .appendTo(this.contents);

    public readonly descLabel = new Label("factionDesc")
        .addClass(ProjectPanelClasses.FactionLabel)
        .setText("Description:")
        .appendTo(this.contents);

    public readonly factionDescription = new TextArea()
        .addClass(ProjectPanelClasses.FactionDesc)
        .setInputText(this.faction.description)
        .setId("factionDesc")
        .addChangeListener(input => this.faction.description = input.element.value)
        .appendTo(this.contents);

    public readonly colourLabel = new Label("factionColour")
        .addClass(ProjectPanelClasses.FactionLabel)
        .setText("Colour:")
        .appendTo(this.contents);

    public readonly factionColour = new ColourInput()
        .addClass(ProjectPanelClasses.FactionColour)
        .setInputColour(this.faction.colour)
        .setId("factionColour")
        .addChangeListener(input => this.onChangeColour(input.element.value as `#${string}`))
        .appendTo(this.contents);


    public constructor (public readonly faction: Faction, public readonly world: World) {
        super("details");
        this.addClass(ProjectPanelClasses.FactionDetails);
        this.updateLabel(faction.name);
    }

    private onChangeColour (colour: `#${string}`) {
        this.faction.colour = colour;
        for (const star of this.world.stars) {
            if (star.faction == this.faction) {
                star.updateFaction(this.faction.name);
            }
        }
        this.world.saveLocalStorage();
    }

    public updateLabel (text: string) {
        this.label.setText(text);
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

//#endpro