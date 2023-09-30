import { InputData } from "../systems/InputManager.js";
import { StoreData } from "../utility/Store.js";
import Component from "./Component.js";



export default class InputInput extends Component<"button"> {

    public currentInput?: InputData;

    public constructor () {
        super("button");
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
        document.addEventListener("keydown", this.handleInputDown);
        document.addEventListener("keyup", this.handleInputUp);
        // document.addEventListener("mousedown", this.handleInputDown);
        // document.addEventListener("mouseup", this.handleInputUp);
        // document.addEventListener("wheel", this.handleInputUp);

    }

    private stopListening () {
        document.removeEventListener("keydown", this.handleInputDown);
        document.removeEventListener("keyup", this.handleInputUp);
        // document.removeEventListener("mousedown", this.handleInputDown);
        // document.removeEventListener("mouseup", this.handleInputUp);
        // document.removeEventListener("wheel", this.handleInputUp);
    }

    private handleInputDown (event: KeyboardEvent | MouseEvent) {
        this.setTextFromInput(InputData.fromEvent(event));
        event.preventDefault();
    }

    private handleInputUp (event: KeyboardEvent | MouseEvent | WheelEvent) {
        this.currentInput = InputData.fromEvent(event);
        event.preventDefault();
        this.stopListening();
        this.emitEvent("change");
    }
}