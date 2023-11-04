import World from "./World.js";
import FactionShaderMaterial from "./components/shaders/FactionShaderMaterial.js";

(async function () {

    await FactionShaderMaterial.init();
    const world = new World;

    function render () {
        requestAnimationFrame(render);

        world.render();
    }

    render();
})();
