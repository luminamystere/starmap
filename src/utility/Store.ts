import { InputData } from "../systems/InputManager.js";

export interface StoreData {
    invertX?: boolean;
    invertY?: boolean;
    sensitivity: number;
    keyForward: InputData;
    keyBack: InputData;
    keyLeft: InputData;
    keyRight: InputData;
    keyUp: InputData;
    keyDown: InputData;
    keyInputSpeedUp: InputData;
    keyInputSpeedDown: InputData;
    keyCursorCloser: InputData;
    keyCursorFurther: InputData;
    keyMoveStar: InputData;
    keyCreateStarpath: InputData;
    keyOpenStarPanel: InputData;
    keyOpenStarpathPanel: InputData;
    keyCreateStar: InputData;
    keyClosePanel: InputData;
    // starpathModifier: InputData;

}

const defaults: StoreData = {
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
    keyCreateStarpath: InputData.create("Ctrl + Right Click"),
    keyOpenStarPanel: InputData.create("Right Click"),
    keyOpenStarpathPanel: InputData.create("Right Click"),
    keyCreateStar: InputData.create("Right Click"),
    keyClosePanel: InputData.create("Escape"),
    // starpathModifier: InputData.create("Right Click", true),
}

export const rebindableKeyDefinitions: { [KEY in keyof StoreData as KEY extends `key${string}` ? KEY : never]: string } = {
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
}

const Store = new Proxy({} as Partial<StoreData>, {
    get (_, property) {
        if (typeof property == "symbol") {
            return undefined;
        }
        return JSON.parse(localStorage.getItem(property) ?? "null") ?? defaults[property as keyof StoreData];
    },
    set (_, property, newValue) {
        if (typeof property == "symbol") {
            return false;
        }
        localStorage.setItem(property, JSON.stringify(newValue));
        return true;
    },
    deleteProperty (_, property) {
        if (typeof property == "symbol") {
            return false;
        }
        localStorage.removeItem(property);
        return true;
    },
});
(window as any).Store = Store;
export default Store;
