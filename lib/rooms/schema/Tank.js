"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tank = void 0;
const GameObject_1 = require("./GameObject");
const Weapon_1 = require("./Weapon");
class Tank extends GameObject_1.GameObject {
    constructor(client) {
        super("images/tank.png", 5, 5);
        this.client = client;
        this.health = 100;
        this.weapon = new Weapon_1.Pistol();
    }
    getType() {
        return "tank";
    }
}
exports.Tank = Tank;
