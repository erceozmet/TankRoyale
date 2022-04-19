"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projectile = void 0;
const schema_1 = require("@colyseus/schema");
const GameObject_1 = require("./GameObject");
class Projectile extends GameObject_1.GameObject {
    constructor(tank_id, damage, direction, range, speed, loc) {
        super("images/projectile.png", 1, 1);
        this.tank_id = tank_id;
        this.damage = damage;
        this.direction = direction;
        this.rangeRemaining = range;
        this.speed = speed;
        this.col = loc.col;
        this.row = loc.row;
        this.initial_col = loc.col;
        this.initial_row = loc.row;
    }
    getType() {
        return "projectile";
    }
}
__decorate([
    schema_1.type("number")
], Projectile.prototype, "speed", void 0);
__decorate([
    schema_1.type("number")
], Projectile.prototype, "direction", void 0);
__decorate([
    schema_1.type("number")
], Projectile.prototype, "initial_col", void 0);
__decorate([
    schema_1.type("number")
], Projectile.prototype, "initial_row", void 0);
exports.Projectile = Projectile;
