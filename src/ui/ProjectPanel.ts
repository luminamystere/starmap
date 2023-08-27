import { Color } from "three";
import World from "../World.js";
import Faction from "../components/Faction.js";
import Button from "./Button.js";
import Component from "./Component.js";
import Panel from "./Panel.js";

export enum ProjectPanelClasses {
    Main = "projectpanel",
    Label = "projectpanel-label",
    Name = "projectpanel-name",
    Description = "projectpanel-description",
    FactionBox = "projectpanel-box",
    Colour = "projectpanel-colour",
    Delete = "projectpanel-delete",
    Button = "projectpanel-button",
}

export default class ProjectPanel extends Panel {

    public readonly newFaction = new Button()
        .addClass(ProjectPanelClasses.Button)
        .setText("Add Faction")
        .addEventListener("click", () => this.addFaction())
        .appendTo(this.content);

    public readonly factionBox = new Component("div")
        .addClass(ProjectPanelClasses.FactionBox)
        .appendTo(this.content);

    public readonly exportButton = new Button()
        .addClass(ProjectPanelClasses.Button)
        .setText("EXPORT")
        .addEventListener("click", () => this.exportData())
        .appendTo(this.content);

    public readonly importButton = new Button()
        .addClass(ProjectPanelClasses.Button)
        .setText("IMPORT")
        .addEventListener("click", () => this.importData())
        .appendTo(this.content);



    public constructor (public readonly world: World) {
        super();
        this.element.setAttribute("id", "projectPanel");
        this.addClass(ProjectPanelClasses.Main);
        for (const i in this.world.factions) {
            this.displayFaction(world.factions[i]);
        }
    }

    public addFaction () {
        console.log("add faction");
        const name = "faction no " + this.world.factions.length;
        const colour = new Color(0xffffff);
        colour.setHex(Math.random() * 0xffffff);
        const faction = new Faction(name, "Add Text Here!", colour);
        this.world.factions.push(faction);
    }

    public displayFaction (faction: Faction) {


    }

    public exportData () {
        console.log("export data");
    }

    public importData () {
        console.log("import data");
    }
}