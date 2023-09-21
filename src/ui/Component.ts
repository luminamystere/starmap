export default class Component<TAG_NAME extends keyof HTMLElementTagNameMap> {

    public element: HTMLElementTagNameMap[TAG_NAME];

    public constructor (tagName: TAG_NAME) {
        this.element = document.createElement(tagName);
    }

    public addClass (...className: string[]) {
        this.element.classList.add(...className);
        return this;
    }

    public removeClass (...className: string[]) {
        this.element.classList.remove(...className);
        return this;
    }

    public hasClass (className: string) {
        return this.element.classList.contains(className);
    }

    public setAttribute (attributeName: string, value: string) {
        this.element.setAttribute(attributeName, value);
        return this;
    }

    public getAttribute (attributeName: string) {
        return this.element.getAttribute(attributeName);
    }

    public addAttribute (attributeName: string) {
        this.element.setAttribute(attributeName, "");
        return this;
    }

    public removeAttribute (attributeName: string) {
        this.element.removeAttribute(attributeName);
        return this;
    }

    public setId (id: string) {
        this.element.id = id;
        return this;
    }

    public append (...components: AnyComponent[]) {
        for (const component of components) {
            component.appendTo(this);
        }
        return this;
    }

    public appendTo (component: AnyComponent) {
        component.element.appendChild(this.element);
        return this;
    }

    public prepend (...components: AnyComponent[]) {
        for (let i = components.length - 1; i >= 0; i--) {
            components[i].prependTo(this);
        }
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

    public addText (text: string) {
        this.element.append(document.createTextNode(text));
        return this;
    }

}
export type AnyComponent = Component<keyof HTMLElementTagNameMap>;


