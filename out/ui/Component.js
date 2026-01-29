export default class Component {
    constructor(tagName) {
        this.listenerMap = {};
        this.element = document.createElement(tagName);
    }
    addClass(...className) {
        this.element.classList.add(...className);
        return this;
    }
    removeClass(...className) {
        this.element.classList.remove(...className);
        return this;
    }
    hasClass(className) {
        return this.element.classList.contains(className);
    }
    setAttribute(attributeName, value) {
        this.element.setAttribute(attributeName, value);
        return this;
    }
    getAttribute(attributeName) {
        return this.element.getAttribute(attributeName);
    }
    addAttribute(attributeName) {
        this.element.setAttribute(attributeName, "");
        return this;
    }
    removeAttribute(attributeName) {
        this.element.removeAttribute(attributeName);
        return this;
    }
    setId(id) {
        this.element.id = id;
        return this;
    }
    append(...components) {
        for (const component of components) {
            component.appendTo(this);
        }
        return this;
    }
    appendTo(component) {
        component.element.appendChild(this.element);
        return this;
    }
    prepend(...components) {
        for (let i = components.length - 1; i >= 0; i--) {
            components[i].prependTo(this);
        }
        return this;
    }
    prependTo(component) {
        component.element.insertBefore(this.element, component.element.firstChild);
        return this;
    }
    remove() {
        this.element.remove();
    }
    emitEvent(event, eventInfo) {
        this.element.dispatchEvent(new Event(event, eventInfo));
    }
    addEventListener(event, handler) {
        var _a;
        const realHandler = (event) => handler(this, event);
        this.element.addEventListener(event, realHandler);
        (_a = this.listenerMap)[event] ?? (_a[event] = new WeakMap());
        this.listenerMap[event].set(handler, realHandler);
        return this;
    }
    removeEventListener(event, handler) {
        const realHandler = this.listenerMap[event]?.get(handler);
        if (realHandler) {
            this.element.removeEventListener(event, realHandler);
        }
        return this;
    }
    setText(text) {
        this.element.textContent = text;
        return this;
    }
    addText(text) {
        this.element.append(document.createTextNode(text));
        return this;
    }
}
