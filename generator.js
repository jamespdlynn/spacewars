var micro = require("microjs");

micro.register({
    angle :  {type:"float", byteLength:2, precision:4},
    isAccelerating : "boolean",
    isFiring : "boolean"
}, "PlayerUpdate");

exports.binary = function binary(size, fn) {
    var random = Math.random();
    var buffer = micro.toBinary({
        angle : (random * Math.PI * 2) - Math.PI,
        isAccelerating : random >= 0.5,
        isFiring : random < 0.25 || random >= 0.75
    }, "PlayerUpdate");
    fn(undefined, buffer);
};