import World from "./World.js";


const world = new World;

function render () {
    requestAnimationFrame(render);

    world.render();
}

render();