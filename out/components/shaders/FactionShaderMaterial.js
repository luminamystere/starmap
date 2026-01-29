import { ShaderMaterial } from "three";
export default class FactionShaderMaterial extends ShaderMaterial {
    static async init() {
        FactionShaderMaterial.vertexShader ?? (FactionShaderMaterial.vertexShader = await fetch('./static/shaders/faction.vert').then(response => response.text()));
        FactionShaderMaterial.fragmentShader ?? (FactionShaderMaterial.fragmentShader = await fetch('./static/shaders/faction.frag').then(response => response.text()));
    }
    constructor(parameters) {
        super({
            vertexShader: FactionShaderMaterial.vertexShader,
            fragmentShader: FactionShaderMaterial.fragmentShader,
            ...parameters,
        });
    }
}
