namespace Math2 {
    export function clamp (min: number, max: number, value: number) {
        return Math.max(min, Math.min(max, value));
    }
}

export default Math2;