import { WebGLRenderer } from 'three';

//export default class Renderer {
function createRenderer () {
    const renderer = new WebGLRenderer({ antialias: true });
    return renderer;
}

export { createRenderer };
