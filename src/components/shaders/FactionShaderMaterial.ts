import { ShaderMaterial, ShaderMaterialParameters } from "three";

export default class FactionShaderMaterial extends ShaderMaterial {

    private static vertexShader?: string;
    private static fragmentShader?: string;

    public static async init () {
        FactionShaderMaterial.vertexShader ??= await fetch('./static/shaders/faction.vert').then(response => response.text());
        FactionShaderMaterial.fragmentShader ??= await fetch('./static/shaders/faction.frag').then(response => response.text());
    }

    public constructor (parameters?: ShaderMaterialParameters) {
        super({
            vertexShader: FactionShaderMaterial.vertexShader,
            fragmentShader: FactionShaderMaterial.fragmentShader,
            ...parameters,
        });
    }
}