"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projectile = void 0;
const GameObject_1 = require("./GameObject");
class Projectile extends GameObject_1.GameObject {
    constructor(tank_id, damage, direction, range, speed) {
        super("images/projectile.png", 1, 1);
        this.tank_id = tank_id;
        this.damage = damage;
        this.direction = direction;
        this.rangeRemaining = range;
        this.speed = speed;
        this.loc = null;

    }
    getType() {
        return "projectile";
    }
}
exports.Projectile = Projectile;
