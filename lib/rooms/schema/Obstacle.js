"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Obstacle = void 0;
const GameObject_1 = require("./GameObject");
class Obstacle extends GameObject_1.GameObject {
    constructor(height, width) {
        super("images/obstacle.png", height, width);
    }
    getType() {
        return "obstacle";
    }
}
exports.Obstacle = Obstacle;
