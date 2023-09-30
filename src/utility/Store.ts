import { InputData } from "../systems/InputManager.js";

export interface StoreData {
    invertX?: boolean;
    invertY?: boolean;
    sensitivity: number;
    forwardKey: InputData;
    backKey: InputData;
    leftKey: InputData;
    rightKey: InputData;
    upKey: InputData;
    downKey: InputData;
    inputSpeedUp: InputData;
    inputSpeedDown: InputData;
    // starpathModifier: InputData;

}

const defaults: StoreData = {
    sensitivity: 0.5,
    forwardKey: InputData.create("KeyW"),
    backKey: InputData.create("KeyS"),
    leftKey: InputData.create("KeyA"),
    rightKey: InputData.create("KeyD"),
    upKey: InputData.create("Space"),
    downKey: InputData.create("ShiftLeft"),
    inputSpeedUp: InputData.create("Scroll Up"),
    inputSpeedDown: InputData.create("Scroll Down"),
    // starpathModifier: InputData.create("Right Click", true),
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
