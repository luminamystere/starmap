export default class Component<TAG_NAME extends keyof HTMLElementTagNameMap> {

    public element: HTMLElementTagNameMap[TAG_NAME];

    public constructor (tagName: TAG_NAME) {
        this.element = document.createElement(tagName);
    }

    public addClass (className: string) {
        this.element.classList.add(className);
        return this;
    }

    public setId (id: string) {
        this.element.id = id;
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

    public remove () {
        this.element.remove();
    }

    public emitEvent (event: string, eventInfo?: object) {
        this.element.dispatchEvent(new Event(event, eventInfo));
    }

    public readonly listenerMap: Record<string, WeakMap<Function, Function>> = {};
    public addEventListener (event: string, handler: (component: this, event: Event) => any) {
        const realHandler = (event: Event) => handler(this, event);
        this.element.addEventListener(event, realHandler);
        this.listenerMap[event] ??= new WeakMap();
        this.listenerMap[event].set(handler, realHandler);
        return this;
    }

    public removeEventListener (event: string, handler: (component: this, event: Event) => any) {
        const realHandler = this.listenerMap[event]?.get(handler)
        if (realHandler) {
            this.element.removeEventListener(event, realHandler as any);
        }
        return this;
    }

    public setText (text: string) {
        this.element.textContent = text;
        return this;
    }

}
export type AnyComponent = Component<keyof HTMLElementTagNameMap>;


