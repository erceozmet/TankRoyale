"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShotgunWeapon = exports.MachinegunWeapon = exports.SniperWeapon = exports.PistolWeapon = exports.Weapon = void 0;
const schema_1 = require("@colyseus/schema");
const GameObject_1 = require("./GameObject");
const Projectile_1 = require("./Projectile");
class Weapon extends GameObject_1.GameObject {
    constructor(damage, fire_rate, range, speed) {
        super("images/weapon.png", 3, 3);
        this.fireCountdown = 0;
        this.damage = damage;
        this.fire_rate = fire_rate;
        this.range = range;
        this.speed = speed;
    }
    getType() {
        return "weapon";
    }
    shootProjectile(tank_id, direction, id) {
        let projectile = new Projectile_1.Projectile(tank_id, this.damage, direction, this.range, this.speed);
        projectile.id = id;
        return projectile;
    }
}
__decorate([
    schema_1.type("number")
], Weapon.prototype, "damage", void 0);
__decorate([
    schema_1.type("number")
], Weapon.prototype, "fire_rate", void 0);
__decorate([
    schema_1.type("number")
], Weapon.prototype, "range", void 0);
__decorate([
    schema_1.type("number")
], Weapon.prototype, "speed", void 0);
exports.Weapon = Weapon;
class PistolWeapon extends Weapon {
    constructor() {
        super(20, 40, 25, 1);
    }
}
exports.PistolWeapon = PistolWeapon;
class SniperWeapon extends Weapon {
    constructor() {
        super(40, 25, 70, 70);
    }
}
exports.SniperWeapon = SniperWeapon;
class MachinegunWeapon extends Weapon {
    constructor() {
        super(5, 100, 25, 50);
    }
}
exports.MachinegunWeapon = MachinegunWeapon;
class ShotgunWeapon extends Weapon {
    constructor() {
        super(50, 25, 15, 30);
    }
}
exports.ShotgunWeapon = ShotgunWeapon;
