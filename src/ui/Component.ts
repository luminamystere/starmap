export default class Component<TAG_NAME extends keyof HTMLElementTagNameMap> {

    public element: HTMLElementTagNameMap[TAG_NAME];

    public constructor (tagName: TAG_NAME) {
        this.element = document.createElement(tagName);
    }

    public addClass (className: string) {
        this.element.classList.add(className);
        return this;
    }

    public appendTo (component: AnyComponent) {
        component.element.appendChild(this.element);
        return this;
    }

    public prependTo (component: AnyComponent) {
        component.element.insertBefore(this.element, component.element.firstChild);
        return this;
    }

}
export type AnyComponent = Component<keyof HTMLElementTagNameMap>;


