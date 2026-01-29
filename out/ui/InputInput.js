import { InputData } from "../systems/InputManager.js";
import Component from "./Component.js";
export var InputInputClasses;
(function (InputInputClasses) {
    InputInputClasses["Main"] = "input-input";
    InputInputClasses["Listening"] = "input-input-listening";
})(InputInputClasses || (InputInputClasses = {}));
export default class InputInput extends Component {
    constructor() {
        super("button");
        this.addClass(InputInputClasses.Main);
        this.addEventListener("click", () => this.startListening());
        this.handleInputDown = this.handleInputDown.bind(this);
        this.handleInputUp = this.handleInputUp.bind(this);
    }
    setInput(input) {
        this.currentInput = input;
        this.refreshText();
        return this;
    }
    addChangeListener(handler) {
        this.addEventListener("change", handler);
        return this;
    }
    removeChangeListener(handler) {
        this.removeEventListener("change", handler);
        return this;
    }
    refreshText() {
        this.setTextFromInput(this.currentInput);
    }
    setTextFromInput(input) {
        if (!input) {
            this.setText("");
            return;
        }
        const { code, ctrl, shift, alt } = input;
        this.setText((ctrl ? "Ctrl + " : "")
            + (shift ? "Shift + " : "")
            + (alt ? "Alt + " : "")
            + code);
    }
    startListening() {
        this.addClass(InputInputClasses.Listening);
        document.addEventListener("keydown", this.handleInputDown);
        document.addEventListener("keyup", this.handleInputUp);
        document.addEventListener("mousedown", this.handleInputDown);
        document.addEventListener("mouseup", this.handleInputUp);
        document.addEventListener("wheel", this.handleInputUp);
        document.addEventListener("contextmenu", event => {
            event.preventDefault();
        });
    }
    stopListening() {
        this.removeClass(InputInputClasses.Listening);
        document.removeEventListener("keydown", this.handleInputDown);
        document.removeEventListener("keyup", this.handleInputUp);
        document.removeEventListener("mousedown", this.handleInputDown);
        document.removeEventListener("mouseup", this.handleInputUp);
        document.removeEventListener("wheel", this.handleInputUp);
        document.removeEventListener("contextmenu", event => {
            event.preventDefault();
        });
    }
    handleInputDown(event) {
        this.setTextFromInput(InputData.fromEvent(event));
        event.preventDefault();
    }
    handleInputUp(event) {
        this.setInput(InputData.fromEvent(event));
        event.preventDefault();
        this.stopListening();
        this.emitEvent("change");
    }
}
