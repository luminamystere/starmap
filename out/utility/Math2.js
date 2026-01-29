var Math2;
(function (Math2) {
    function clamp(min, max, value) {
        return Math.max(min, Math.min(max, value));
    }
    Math2.clamp = clamp;
})(Math2 || (Math2 = {}));
export default Math2;
