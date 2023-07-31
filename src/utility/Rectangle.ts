import Vector2, { IVector2 } from "./Vector2.js";

export default class Rectangle {

    public static fromCentre (centre: IVector2, size: IVector2) {
        const position = new Vector2.Immutable(centre.x - Math.floor(size.x / 2), centre.y - Math.floor(size.y / 2));
        return new Rectangle(position, size);
    }
    public readonly position: Vector2.Immutable
    public readonly size: Vector2.Immutable


    public constructor (
        position: IVector2,
        size: IVector2,
    ) {
        this.position = Vector2.Immutable.of(position);
        this.size = Vector2.Immutable.of(size);
    }

    public get left () {
        return this.position.x;
    }
    public get right () {
        return this.position.x + this.size.x;
    }
    public get top () {
        return this.position.y;
    }
    public get bottom () {
        return this.position.y + this.size.y;
    }


    // split this into two functions
    public intersectsX (rectangle: Rectangle) {
        return this.position.x + this.size.x >= rectangle.position.x
            && this.position.x <= rectangle.position.x + rectangle.size.x
    }
    public intersectsY (rectangle: Rectangle) {
        return this.position.y + this.size.y >= rectangle.position.y
            && this.position.y <= rectangle.position.y + rectangle.size.y;
    }
    public intersects (rectangle: Rectangle) {
        return this.intersectsX(rectangle) && this.intersectsY(rectangle);
    }
}