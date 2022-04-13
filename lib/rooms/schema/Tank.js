"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tank = void 0;
const schema_1 = require("@colyseus/schema");
const GameObject_1 = require("./GameObject");
const Weapon_1 = require("./Weapon");
class Tank extends GameObject_1.GameObject {
    constructor(client) {
        super("images/tank.png", 5, 5);
        this.client = client;
        this.health = 100;
        this.weapon = new Weapon_1.PistolWeapon();
    }
    getType() {
        return "tank";
    }
}
__decorate([
    schema_1.type("number")
], Tank.prototype, "health", void 0);
__decorate([
    schema_1.type(Weapon_1.Weapon)
], Tank.prototype, "weapon", void 0);
exports.Tank = Tank;
