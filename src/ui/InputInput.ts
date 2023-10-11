import { InputData } from "../systems/InputManager.js";
import { StoreData } from "../utility/Store.js";
import Component from "./Component.js";

export enum InputInputClasses {
    Main = "input-input",
    Listening = "input-input-listening",
}

export default class InputInput extends Component<"button"> {

    public currentInput?: InputData;

    public constructor () {
        super("button");
        this.addClass(InputInputClasses.Main);
        this.addEventListener("click", () => this.startListening());
        this.handleInputDown = this.handleInputDown.bind(this);
        this.handleInputUp = this.handleInputUp.bind(this);
    }

    public setInput (input?: InputData) {
        this.currentInput = input;
        this.refreshText();
        return this;
    }

    public addChangeListener (handler: (input: this, event: InputEvent) => any) {
        this.addEventListener("change", handler as any);
        return this;
    }

    public removeChangeListener (handler: (input: this, event: InputEvent) => any) {
        this.removeEventListener("change", handler as any);
        return this;
    }

    private refreshText () {
        this.setTextFromInput(this.currentInput);
    }

    private setTextFromInput (input?: InputData) {
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

    private startListening () {
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

    private stopListening () {
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

    private handleInputDown (event: KeyboardEvent | MouseEvent) {
        this.setTextFromInput(InputData.fromEvent(event));
        event.preventDefault();
    }

    private handleInputUp (event: KeyboardEvent | MouseEvent | WheelEvent) {
        this.setInput(InputData.fromEvent(event));
        event.preventDefault();
        this.stopListening();
        this.emitEvent("change");
    }
}