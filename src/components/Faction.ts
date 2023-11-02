import { Color, MeshBasicMaterial, MeshStandardMaterial, Mesh, Scene, Vector3, BufferGeometry, Float32BufferAttribute, DynamicDrawUsage } from "three";
// import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { marchingCubes } from "./MarchingCubes.js";

export default class Faction {

    private _name: string;
    public get name () {
        return this._name;
    }
    public set name (input: string) {
        this._name = input;
    }
    private _description: string;
    public get description () {
        return this._description
    }
    public set description (input: string) {
        this._description = input;
    }
    private _colour: Color;
    public get colour () {
        return `#${this._colour.getHexString()}`;
    }
    public set colour (input: `#${string}`) {
        this._colour = new Color(input);
    }
    // public marchingCubes: MarchingCubes;
    // public marchingSphere: MarchingCubes;
    // public meshes: Vector3;
    public vertices;
    public meshBufferGeometry: BufferGeometry;
    // public numSpheres: number;
    public spheres: Vector3[] = []
    public metaballs: { center: Vector3, radius: number }[] = [];

    public constructor (name: string, description: string, colour: Color, scene: Scene) {
        this._name = name;
        this._description = description;
        this._colour = colour;
        // this.sphere = new MarchingCubes(22, new MeshBasicMaterial({ color: 0xFFFFFF }), true, true, 10000);
        const sphereMaterial = new MeshStandardMaterial({ color: this._colour });
        // this.marchingCubes = new MarchingCubes(28, sphereMaterial, false, true, 10000);
        // this.marchingCubes.position.set(0, 0, 0);
        // this.marchingCubes.scale.set(1, 1, 1);
        // this.sphere.addBall(0, 0, 0, 10, 10);
        const maxPolygons = 20000;
        this.vertices = Array(3 * maxPolygons).fill(0);
        this.meshBufferGeometry = new BufferGeometry();
        const buffer = new Float32BufferAttribute(this.vertices, 3);
        buffer.setUsage(DynamicDrawUsage);
        this.meshBufferGeometry.setAttribute('position', buffer);
        const mesh = new Mesh(this.meshBufferGeometry, sphereMaterial)
        scene.add(mesh);
        // this.numSpheres = 1;
        console.log("added ball?");
        // scene.add(this.marchingCubes);
    }

    public updateMarchingCubes () {
        const triangles = marchingCubes(this.metaballs);
        this.updateMesh(triangles);
    }

    public updateMesh (trianglePoints: Vector3[]) {
        for (let i = 0; i < trianglePoints.length; i++) {
            const x = trianglePoints[i].x;
            const y = trianglePoints[i].y;
            const z = trianglePoints[i].z;

            this.vertices[i * 3] = x;
            this.vertices[i * 3 + 1] = y;
            this.vertices[i * 3 + 2] = z;
        }
        const positionAttribute = new Float32BufferAttribute(this.vertices, 3);
        positionAttribute.setUsage(DynamicDrawUsage);
        this.meshBufferGeometry.setAttribute('position', positionAttribute);
        this.meshBufferGeometry.setDrawRange(0, trianglePoints.length);
        this.meshBufferGeometry.computeVertexNormals();
        this.meshBufferGeometry.getAttribute('position').needsUpdate = true;
        this.meshBufferGeometry.getAttribute('normal').needsUpdate = true;
    }

    // public updateSpheres () {
    //     // console.log("updating spheres");
    //     this.marchingCubes.reset();
    //     const subtract = 1;
    //     const strength = 1.2 / ((Math.sqrt(this.spheres.length) - 1) / 4 + 1);
    //     // const strength = 100;
    //     this.marchingCubes.isolation = 20;

    //     for (const sphere of this.spheres) {
    //         this.marchingCubes.addBall(sphere.x, sphere.y, sphere.z, strength, subtract, this._colour);
    //         this.marchingCubes.addBall(0, 0, 0, strength, subtract, this._colour);
    //     }
    //     this.marchingCubes.update();
    // }

    public addSphere (position: Vector3) {
        this.spheres.push(position);
        // this.metaBalls.push({ center: position, radius: 0.25 });
        this.metaballs.push({ center: position, radius: 0.25 });
    }

    public removeSphere (position: Vector3) {

    }
}