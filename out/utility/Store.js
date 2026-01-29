import { InputData } from "../systems/InputManager.js";
const defaults = {
    invertX: false,
    invertY: false,
    sensitivity: 0.5,
    keyForward: InputData.create("KeyW"),
    keyBack: InputData.create("KeyS"),
    keyLeft: InputData.create("KeyA"),
    keyRight: InputData.create("KeyD"),
    keyUp: InputData.create("Space"),
    keyDown: InputData.create("ShiftLeft"),
    keyInputSpeedUp: InputData.create("Scroll Up"),
    keyInputSpeedDown: InputData.create("Scroll Down"),
    keyCursorCloser: InputData.create("Scroll Up"),
    keyCursorFurther: InputData.create("Scroll Down"),
    keyMoveStar: InputData.create("Left Click"),
    keyCreateStarpath: InputData.create("Right Click", true),
    keyOpenStarPanel: InputData.create("Right Click"),
    keyOpenStarpathPanel: InputData.create("Right Click"),
    keyCreateStar: InputData.create("Right Click"),
    keyClosePanel: InputData.create("Escape"),
};
export const rebindableKeyDefinitions = {
    keyForward: "Forward",
    keyBack: "Back",
    keyLeft: "Left",
    keyRight: "Right",
    keyUp: "Up",
    keyDown: "Down",
    keyInputSpeedUp: "Increase Movement Speed",
    keyInputSpeedDown: "Decrease Movement Speed",
    keyMoveStar: "Hold & Move Star",
    keyCursorCloser: "Held Object Closer",
    keyCursorFurther: "Held Object Further",
    keyCreateStar: "Create Star",
    keyCreateStarpath: "Create Starpath",
    keyOpenStarPanel: "Open Star Panel",
    keyOpenStarpathPanel: "Open Starpath Panel",
    keyClosePanel: "Close Panel",
};
const Store = new Proxy({}, {
    get(_, property) {
        if (typeof property == "symbol") {
            return undefined;
        }
        return JSON.parse(localStorage.getItem(property) ?? "null") ?? defaults[property];
    },
    set(_, property, newValue) {
        if (typeof property == "symbol") {
            return false;
        }
        localStorage.setItem(property, JSON.stringify(newValue));
        return true;
    },
    deleteProperty(_, property) {
        if (typeof property == "symbol") {
            return false;
        }
        localStorage.removeItem(property);
        return true;
    },
});
window.Store = Store;
export default Store;
