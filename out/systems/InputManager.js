export var InputData;
(function (InputData) {
    function create(code, ctrl = false, shift = false, alt = false) {
        return {
            code,
            ctrl,
            shift,
            alt,
        };
    }
    InputData.create = create;
    const mouseNameMap = {
        [0]: "Left Click",
        [1]: "Middle Click",
        [2]: "Right Click",
    };
    function fromEvent(event) {
        return {
            ctrl: event.ctrlKey && event.code != "ControlLeft" && event.code != "ControlRight",
            alt: event.altKey && event.code != "AltLeft" && event.code != "AltRight",
            shift: event.shiftKey && event.code != "ShiftLeft" && event.code != "ShiftRight",
            code: event instanceof WheelEvent ? `Scroll ${event.deltaY < 0 ? "Up" : "Down"}`
                : event instanceof MouseEvent ? mouseNameMap[event.button] ?? `Mouse ${event.button}`
                    : event.code
        };
    }
    InputData.fromEvent = fromEvent;
    function equals(a, b) {
        return a.code == b.code && a.ctrl == b.ctrl && a.alt == b.alt && a.shift == b.shift;
    }
    InputData.equals = equals;
})(InputData || (InputData = {}));
class InputManager {
    static isDown(input) {
        return !!input
            && !!InputManager.state[input.code]
            && (!input.ctrl || !!(InputManager.state.CtrlLeft || InputManager.state.CtrlRight))
            && (!input.shift || !!(InputManager.state.ShiftLeft || InputManager.state.ShiftRight))
            && (!input.alt || !!(InputManager.state.AltLeft || InputManager.state.AltRight));
    }
    static timeDown(input) {
        return !!input
            && (!input.ctrl || !!(InputManager.state.CtrlLeft || InputManager.state.CtrlRight))
            && (!input.shift || !!(InputManager.state.ShiftLeft || InputManager.state.ShiftRight))
            && (!input.alt || !!(InputManager.state.AltLeft || InputManager.state.AltRight))
            && (InputManager.state[input.code] ?? false);
    }
    static isUp(input) {
        return !InputManager.isDown(input);
    }
    static addListener(edge, input, handler) {
        const listener = { edge, input, handler };
        InputManager.listeners.push(listener);
        return listener;
    }
    static removeListener(listener) {
        const listenerIndex = InputManager.listeners.indexOf(listener);
        if (listenerIndex === -1) {
            return;
        }
        InputManager.listeners.splice(listenerIndex, 1);
    }
    static getHoveredElement() {
        return document.elementFromPoint(InputManager.mouseX, InputManager.mouseY);
    }
    static handleInputDown(event) {
        var _a, _b;
        const input = InputData.fromEvent(event);
        (_a = InputManager.state)[_b = input.code] ?? (_a[_b] = Date.now());
        InputManager.emitEvent("down", input, event);
        if (event instanceof WheelEvent) {
            InputManager.handleInputUp(event);
        }
    }
    static handleInputUp(event) {
        const input = InputData.fromEvent(event);
        delete InputManager.state[input.code];
        InputManager.emitEvent("up", input, event);
    }
    static emitEvent(edge, input, event) {
        for (const listener of InputManager.listeners) {
            if (listener.edge != edge)
                continue;
            const checkInput = typeof listener.input == "function" ? listener.input() : listener.input;
            if (!checkInput)
                continue;
            if (InputData.equals(checkInput, input)) {
                if (listener.handler(InputManager)) {
                    const element = event.target;
                    if (element?.tagName !== "INPUT" || element.type !== "range")
                        event.preventDefault();
                    break;
                }
            }
        }
    }
}
InputManager.state = {};
InputManager.event = new EventTarget();
InputManager.mouseX = 0;
InputManager.mouseY = 0;
InputManager.listeners = [];
(() => {
    document.body.addEventListener("keydown", InputManager.handleInputDown);
    document.body.addEventListener("keyup", InputManager.handleInputUp);
    document.body.addEventListener("mousedown", InputManager.handleInputDown);
    document.body.addEventListener("mouseup", InputManager.handleInputUp);
    document.body.addEventListener("wheel", InputManager.handleInputDown);
    document.body.addEventListener("mousemove", event => {
        InputManager.mouseX = event.clientX;
        InputManager.mouseY = event.clientY;
    });
    window.InputManager = InputManager;
})();
export default InputManager;
