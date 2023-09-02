import Component from "./Component.js";

export default class SelectInput extends Component<"select"> {
    public constructor () {
        super("select");
    }

    public addEntry (entry: string) {
        this.element.options.add(new Option(entry, entry));
        return this;
    }

    public addChangeListener (handler: (input: this, event: InputEvent) => any) {
        this.addEventListener("change", handler as any);
        return this;
    }
}