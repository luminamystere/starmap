import World from "./World.js";

// const canvas = document.createElement("canvas");
// document.body.appendChild(canvas);

let width = 0;
let height = 0;

// function main () {
//     const container = document.querySelector('#scene-container');

//     const world = new World();

//     world._Initialise();
// }

// main();

// function resize () {
//     width = canvas.width;
//     height = canvas.height;
//     canvas.style.width = `${width}px`;
//     canvas.style.height = `${height}px`;
// }

// window.addEventListener("resize", resize);
// resize();


let context: CanvasRenderingContext2D | null = null;

const world = new World;

function render () {
    // context ??= canvas.getContext("2d");
    requestAnimationFrame(render);
    // if (!context)
    //     return;

    // context.clearRect(0, 0, width, height);

    //here's the game!
    world.render();
}

render();