import Star from "../components/Star.js";
import Panel from "./Panel.js";

export default class StarPanel extends Panel {

    public constructor (star: Star) {
        super();
        this.title.element.textContent = star.name;
        this.element.setAttribute("id", "starPanel");
    }
}