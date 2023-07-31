import Vector2 from "./Vector2.js";

enum Direction {
    Right,
    Down,
    Left,
    Up,
}
namespace Direction {
    export const VECTOR = {
        [Direction.Right]: new Vector2.Immutable(1, 0),
        [Direction.Down]: new Vector2.Immutable(0, 1),
        [Direction.Left]: new Vector2.Immutable(-1, 0),
        [Direction.Up]: new Vector2.Immutable(0, -1),
    };
}
export default Direction;