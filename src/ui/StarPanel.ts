import Star from "../components/Star.js";
import Panel from "./Panel.js";
import TextInput from "./TextInput.js";

export default class StarPanel extends Panel {

    public readonly starName = new TextInput()
        .addClass("starName")
        .appendTo(this);

    public constructor (star: Star) {
        super();
        this.title.element.textContent = star.name;
        this.element.setAttribute("id", "starPanel");

        this.starName.setText(star.name);
    }
}