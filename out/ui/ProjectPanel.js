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
import TextInput from "./TextInput.js";
export var ProjectPanelClasses;
(function (ProjectPanelClasses) {
    ProjectPanelClasses["Main"] = "projectpanel";
    ProjectPanelClasses["Popup"] = "projectpanel-popup";
    ProjectPanelClasses["PopupText"] = "projectpanel-popup-text";
    ProjectPanelClasses["PopupButton"] = "projectpanel-popup-button";
    ProjectPanelClasses["Name"] = "projectpanel-name";
    ProjectPanelClasses["Label"] = "projectpanel-label";
    ProjectPanelClasses["Select"] = "projectpanel-select";
    ProjectPanelClasses["Description"] = "projectpanel-description";
    ProjectPanelClasses["FactionDialog"] = "projectpanel-faction-dialog";
    ProjectPanelClasses["FactionContainer"] = "projectpanel-faction-container";
    ProjectPanelClasses["FactionBox"] = "projectpanel-faction-box";
    ProjectPanelClasses["Faction"] = "projectpanel-faction";
    ProjectPanelClasses["FactionLabel"] = "projectpanel-faction-label";
    ProjectPanelClasses["FactionsButton"] = "projectpanel-faction-button";
    ProjectPanelClasses["FactionButton"] = "projectpanel-faction-dialog-button";
    ProjectPanelClasses["FactionDetails"] = "projectpanel-faction-details";
    ProjectPanelClasses["FactionSummary"] = "projectpanel-faction-summary";
    ProjectPanelClasses["FactionName"] = "projectpanel-faction-name";
    ProjectPanelClasses["FactionDesc"] = "projectpanel-faction-description";
    ProjectPanelClasses["FactionColour"] = "projectpanel-faction-colour";
    ProjectPanelClasses["FactionDelete"] = "projectpanel-faction-delete";
    ProjectPanelClasses["BackgroundLabel"] = "projectpanel-background-label";
    ProjectPanelClasses["Background"] = "projectpanel-background-select";
    ProjectPanelClasses["ButtonContainer"] = "projectpanel-container";
    ProjectPanelClasses["ButtonThreeWide"] = "projectpanel-container-wide";
    ProjectPanelClasses["Button"] = "projectpanel-button";
    ProjectPanelClasses["FakeButton"] = "projectpanel-fakebutton";
    ProjectPanelClasses["HiddenButton"] = "projectpanel-hiddenbutton";
    ProjectPanelClasses["ControlsGuide"] = "projectpanel-controls";
    ProjectPanelClasses["ControlsHeading"] = "projectpanel-controls-heading";
    ProjectPanelClasses["ControlsText"] = "projectpanel-controls-text";
    ProjectPanelClasses["OptionsInput"] = "projectpanel-options-input";
    ProjectPanelClasses["OptionsMenu"] = "projectpanel-options";
    ProjectPanelClasses["OptionsContent"] = "projectpanel-options-content";
    ProjectPanelClasses["OptionsContainer"] = "projectpanel-options-container";
    ProjectPanelClasses["OptionsLabel"] = "projectpanel-options-label";
    ProjectPanelClasses["OptionsHeading"] = "projectpanel-options-heading";
    ProjectPanelClasses["OptionsCheck"] = "projectpanel-options-check";
    ProjectPanelClasses["OptionsButtonsContainer"] = "projectpanel-options-buttoncontainer";
    ProjectPanelClasses["OptionsKeybindsContainer"] = "projectpanel-options-keybindscontainer";
    ProjectPanelClasses["OptionsButtons"] = "projectpanel-options-button";
    ProjectPanelClasses["OptionsDefaultButton"] = "projectpanel-options-defaultbutton";
    ProjectPanelClasses["OptionsRange"] = "projectpanel-options-range";
    ProjectPanelClasses["FooterText"] = "projectpanel-footer-text";
})(ProjectPanelClasses || (ProjectPanelClasses = {}));
export default class ProjectPanel extends Panel {
    // public readonly footerText = new Component("p")
    //     .addClass(ProjectPanelClasses.FooterText)
    //     .setText("Here's some text for the footer!")
    //     .appendTo(this.footer);
    constructor(world) {
        super();
        this.world = world;
        this.projNameLabel = new Label("projectName")
            .addClass(ProjectPanelClasses.Label)
            .setText("Name: ")
            .appendTo(this.content);
        this.projName = new TextInput()
            .addClass(ProjectPanelClasses.Name)
            .setInputText(this.world.projectName)
            .setId("projectName")
            .setMaxLength(64)
            .addChangeListener(input => this.world.projectName = input.element.value)
            .appendTo(this.content);
        this.starpathColourLabel = new Label("starpathColour")
            .addClass(ProjectPanelClasses.Label)
            .setText("Default Starpath Colour:")
            .appendTo(this.content);
        this.starpathColourSelect = new ColourInput()
            .addClass(ProjectPanelClasses.Select)
            .setInputColour(this.world.starpathColour)
            .setId("starpathColour")
            .addChangeListener(input => this.world.starpathColour = input.element.value)
            .appendTo(this.content);
        this.backgroundLabel = new Label("background")
            .addClass(ProjectPanelClasses.Label)
            .setText("Select Background:")
            .appendTo(this.content);
        this.backgroundSelect = new SelectInput()
            .addClass(ProjectPanelClasses.Select)
            .addChangeListener((event) => this.world.chooseBackground(event.element.value))
            .setId("background")
            .appendTo(this.content);
        this.buttonContainer = new Component("div")
            .addClass(ProjectPanelClasses.ButtonContainer)
            .appendTo(this.footer);
        this.newStarmapButton = new Button()
            .addClass(ProjectPanelClasses.Button)
            .setText("NEW")
            .addEventListener("click", () => this.newStarmap())
            .appendTo(this.buttonContainer);
        this.exportButton = new Button()
            .addClass(ProjectPanelClasses.Button)
            .setText("EXPORT")
            .addEventListener("click", () => Files.downloadString(`${this.world.projectName.replace(/\W+/g, "-")}.starmap`, this.world.serialiseJSON()))
            .appendTo(this.buttonContainer);
        this.importButton = new Button("label")
            .setAttribute("for", "starmap_import")
            .addClass(ProjectPanelClasses.FakeButton)
            .setText("IMPORT")
            .appendTo(this.buttonContainer);
        this.importInput = new Component("input")
            .setId("starmap_import")
            .addClass(ProjectPanelClasses.HiddenButton)
            .setAttribute("type", "file")
            .setAttribute("accept", ".starmap")
            .addEventListener("change", async (importInput, event) => {
            const file = await Files.uploadStringFromEvent(event);
            if (file) {
                this.world.deserialiseJSON(file);
            }
        })
            .appendTo(this.importButton);
        this.optionsButton = new Button()
            .addClass(ProjectPanelClasses.Button)
            .addClass(ProjectPanelClasses.ButtonThreeWide)
            .setText("OPTIONS")
            .addEventListener("click", () => this.openOptionsPanel())
            .appendTo(this.buttonContainer);
        this.title.element.textContent = "Project";
        this.element.setAttribute("id", "projectPanel");
        this.addClass(ProjectPanelClasses.Main);
        this.backgroundSelect.addEntry("None");
        for (const background of this.world.backgrounds) {
            this.backgroundSelect.addEntry(background.name);
        }
    }
    newStarmap() {
        const popup = new PopupPanel(this.world);
        popup.appendTo(this);
        popup.element.showModal();
    }
    openOptionsPanel() {
        const options = new OptionsDialog(this.world);
        options.appendTo(this);
        options.element.showModal();
    }
    refreshPanel() {
        this.projName.setInputText(this.world.projectName);
        this.starpathColourSelect.setInputColour(this.world.starpathColour);
    }
}
class PopupPanel extends Dialog {
    constructor(world) {
        super(world);
        this.warning = new Component("p")
            .addClass(ProjectPanelClasses.PopupText)
            .append(new Component("b").setText("Warning!"))
            .addText(" Creating a new starmap will clear the existing starmap. ")
            .appendTo(this);
        this.exportbutton = new Button()
            .addClass(ProjectPanelClasses.PopupButton)
            .addClass(PanelClasses.Wide)
            .setText("Export Starmap")
            .addEventListener("click", () => Files.downloadString(`${this.world.projectName.replace(/\W+/g, "-")}.starmap`, this.world.serialiseJSON()))
            .appendTo(this);
        this.cancelButton = new Button()
            .addClass(ProjectPanelClasses.PopupButton)
            .setText("Cancel")
            .addEventListener("click", () => this.remove())
            .appendTo(this);
        this.okButton = new Button()
            .addClass(ProjectPanelClasses.PopupButton)
            .setText("OK")
            .addEventListener("click", () => this.resetWorld())
            .appendTo(this);
        this.addClass(ProjectPanelClasses.Popup);
        this.world.popup = true;
        this.element.addEventListener("cancel", (event) => {
            event.preventDefault();
        });
    }
    resetWorld() {
        this.world.resetWorld();
        this.world.projectPanel?.refreshPanel();
        this.remove();
    }
}
class OptionsDialog extends Dialog {
    constructor(world) {
        super(world);
        this.optionsContainer = new Component("div")
            .addClass(ProjectPanelClasses.OptionsContent)
            .appendTo(this);
        this.buttonContainer = new Component("div")
            .addClass(ProjectPanelClasses.OptionsButtonsContainer)
            .appendTo(this);
        this.resetButton = new Button()
            .addClass(ProjectPanelClasses.OptionsButtons)
            .setText("Reset to Default")
            .addEventListener("click", () => this.resetToDefault())
            .appendTo(this.buttonContainer);
        this.closeButton = new Button()
            .addClass(ProjectPanelClasses.OptionsButtons)
            .setText("Close")
            .addEventListener("click", () => this.remove())
            .appendTo(this.buttonContainer);
        this.addClass(ProjectPanelClasses.OptionsMenu);
        this.appendOptions();
        this.world.popup = true;
        this.element.addEventListener("cancel", (event) => {
            event.preventDefault();
        });
    }
    resetToDefault() {
        for (var i = localStorage.length - 1; i >= 0; i--) {
            const property = localStorage.key(i);
            if ((property) && property != "save") {
                localStorage.removeItem(property);
            }
        }
        this.optionsContainer.element.firstChild?.remove();
        this.appendOptions();
    }
    appendOptions() {
        return new Options().appendTo(this.optionsContainer);
    }
}
class Options extends Component {
    constructor() {
        super("div");
        this.mouseSettingsLabel = new Label()
            .addClass(ProjectPanelClasses.OptionsHeading)
            .addClass(PanelClasses.Wide)
            .setText("Mouse Settings")
            .appendTo(this);
        this.invertXLabel = new Label("invertX")
            .addClass(ProjectPanelClasses.Label)
            .setText("Invert X: ")
            .appendTo(this);
        this.invertX = new CheckboxInput()
            .addClass(ProjectPanelClasses.OptionsCheck)
            .setId("invertX")
            .setChecked(Store.invertX || false)
            .addChangeListener(input => Store.invertX = input.element.checked)
            .appendTo(this);
        this.invertYLabel = new Label("invertY")
            .addClass(ProjectPanelClasses.Label)
            .setText("Invert Y: ")
            .appendTo(this);
        this.invertY = new CheckboxInput()
            .addClass(ProjectPanelClasses.OptionsCheck)
            .setId("invertY")
            .setChecked(Store.invertY || false)
            .addChangeListener(input => Store.invertY = input.element.checked)
            .appendTo(this);
        this.sensitivityLabel = new Label("sensitivity")
            .addClass(ProjectPanelClasses.Label)
            .setText("Mouse Sensitivity:")
            .appendTo(this);
        this.sensitivityInput = new RangeInput(0, 1, 0.01)
            .addClass(ProjectPanelClasses.OptionsRange)
            .setId("sensitivity")
            .setValue(Store.sensitivity ?? 0.5)
            .addChangeListener(input => Store.sensitivity = input.element.valueAsNumber)
            .appendTo(this);
        this.keybindLabel = new Label()
            .addClass(ProjectPanelClasses.OptionsHeading)
            .addClass(PanelClasses.Wide)
            .setText("Keybindings")
            .appendTo(this);
        this.optionsDiv = new Component("div")
            .addClass(ProjectPanelClasses.OptionsKeybindsContainer)
            .appendTo(this);
        this.addClass(ProjectPanelClasses.OptionsContainer);
        this.addClass(PanelClasses.Wide);
        for (const [keybindId, translation] of Object.entries(rebindableKeyDefinitions)) {
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
