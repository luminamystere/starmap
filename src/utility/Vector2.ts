export interface IVector2 {
    readonly x: number;
    readonly y: number;
}

class Vector2 implements IVector2 {

    public get xy (): [x: number, y: number] {
        return [this.x, this.y];
    }
    public constructor (
        public x: number,
        public y: number,
    ) { }

    public add (x: number, y = x) {
        this.x += x;
        this.y += y;
        return this;
    }

    public addVector (vector: IVector2) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    public subtract (x: number, y = x) {
        this.x -= x;
        this.y -= y;
        return this;
    }

    public subtractVector (vector: IVector2) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    public multiply (x: number, y = x) {
        this.x *= x;
        this.y *= y;
        return this;
    }

    public multiplyVector (vector: IVector2) {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    }

    public divide (x: number, y = x) {
        this.x /= x;
        this.y /= y;
        return this;
    }

    public divideVector (vector: IVector2) {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    }

    public floor () {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    public copyImmutable () {
        return new Vector2.Immutable(this.x, this.y);
    }

    public copy () {
        return new Vector2(this.x, this.y);
    }

    public equals (vector: IVector2) {
        return this.x === vector.x && this.y === vector.y;
    }
}

namespace Vector2 {
    export class Immutable implements IVector2 {

        public static of (vector: IVector2) {
            return new Immutable(vector.x, vector.y);
        }

        public get xy (): [x: number, y: number] {
            return [this.x, this.y];
        }

        public constructor (
            public readonly x: number,
            public readonly y: number,
        ) { }

        public copyMutable () {
            return new Vector2(this.x, this.y);
        }

        public equals (vector: IVector2) {
            return this.x === vector.x && this.y === vector.y;
        }
    }

    export const ZERO = new Immutable(0, 0);
    export const ONE = new Immutable(1, 1);
    export const INFINITY = new Immutable(Infinity, Infinity);
    export const NEGATIVE_INFINITY = new Immutable(-Infinity, -Infinity);
}

export default Vector2;