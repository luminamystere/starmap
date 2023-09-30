import { SupplierOr } from "../utility/Types.js";

export interface InputData {
    code: string;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
}
export namespace InputData {

    export function create (code: string, ctrl = false, shift = false, alt = false): InputData {
        return {
            code,
            ctrl,
            shift,
            alt,
        }
    }

    const mouseNameMap: Record<number, string> = {
        [0]: "Left Click",
        [1]: "Middle Click",
        [2]: "Right Click",
    }

    export function fromEvent (event: KeyboardEvent | MouseEvent | WheelEvent): InputData {

        return {
            ctrl: event.ctrlKey,
            alt: event.altKey,
            shift: event.shiftKey,
            code: event instanceof WheelEvent ? `Scroll ${event.deltaY < 0 ? "Up" : "Down"}`
                : event instanceof MouseEvent ? mouseNameMap[event.button] ?? `Mouse ${event.button}`
                    : event.code
        };
    }

    export function equals (a: InputData, b: InputData) {
        return a.code == b.code && a.ctrl == b.ctrl && a.alt == b.alt && a.shift == b.shift;
    }
}

export interface InputListener {
    edge: "down" | "up";
    input: SupplierOr<InputData | undefined>;
    handler: (input: typeof InputManager) => boolean;
}

export default class InputManager {
    public static state: Record<string, number> = {};
    public static event = new EventTarget();
    private static listeners: InputListener[] = [];

    static {
        document.body.addEventListener("keydown", InputManager.handleInputDown);
        document.body.addEventListener("keyup", InputManager.handleInputUp);
        document.body.addEventListener("mousedown", InputManager.handleInputDown);
        document.body.addEventListener("mouseup", InputManager.handleInputUp);
        document.body.addEventListener("wheel", InputManager.handleInputDown);
    }

    public static isDown (input?: InputData) {
        return !!input
            && !!InputManager.state[input.code]
            && (!input.ctrl || !!(InputManager.state.CtrlLeft || InputManager.state.CtrlRight))
            && (!input.shift || !!(InputManager.state.ShiftLeft || InputManager.state.ShiftRight))
            && (!input.alt || !!(InputManager.state.AltLeft || InputManager.state.AltRight));
    }

    public static timeDown (input?: InputData) {
        return !!input
            && (!input.ctrl || !!(InputManager.state.CtrlLeft || InputManager.state.CtrlRight))
            && (!input.shift || !!(InputManager.state.ShiftLeft || InputManager.state.ShiftRight))
            && (!input.alt || !!(InputManager.state.AltLeft || InputManager.state.AltRight))
            && (InputManager.state[input.code] ?? false);
    }

    public static isUp (input?: InputData) {
        return !InputManager.isDown(input);
    }

    public static addListener (edge: "down" | "up", input: SupplierOr<InputData | undefined>, handler: (input: typeof InputManager) => boolean) {
        const listener: InputListener = { edge, input, handler };
        InputManager.listeners.push(listener);
        return listener;
    }

    public static removeListener (listener: InputListener) {
        const listenerIndex = InputManager.listeners.indexOf(listener);
        if (listenerIndex === -1) {
            return;
        }
        InputManager.listeners.splice(listenerIndex, 1);
    }

    private static handleInputDown (event: KeyboardEvent | MouseEvent | WheelEvent) {
        const input = InputData.fromEvent(event);
        InputManager.state[input.code] ??= Date.now();

        InputManager.emitEvent("down", input, event);

        if (event instanceof WheelEvent) {
            InputManager.handleInputUp(event);
        }
    }

    private static handleInputUp (event: KeyboardEvent | MouseEvent | WheelEvent) {
        const input = InputData.fromEvent(event);
        delete InputManager.state[input.code];

        InputManager.emitEvent("up", input, event);
    }

    private static emitEvent (edge: "down" | "up", input: InputData, event: Event) {
        for (const listener of InputManager.listeners) {
            if (listener.edge != edge) continue;

            const checkInput = typeof listener.input == "function" ? listener.input() : listener.input;
            if (!checkInput) continue;

            if (InputData.equals(checkInput, input)) {
                if (listener.handler(InputManager)) {
                    event.preventDefault();
                    break;
                }
            }
        }
    }
}


