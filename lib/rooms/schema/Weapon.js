"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShotgunWeapon = exports.MachinegunWeapon = exports.SniperWeapon = exports.PistolWeapon = exports.Weapon = void 0;
const GameObject_1 = require("./GameObject");
const Projectile_1 = require("./Projectile");
class Weapon extends GameObject_1.GameObject {
    constructor(image, damage, fire_rate, range, speed) {
        super(image, 3, 3);
        this.fireCountdown = 0;
        this.damage = damage;
        this.fire_rate = fire_rate;
        this.range = range;
        this.speed = speed;
    }
    getType() {
        return "weapon";
    }
    shootProjectile(tank_id, direction, id, loc) {
        let projectile = new Projectile_1.Projectile(tank_id, this.damage, direction, this.range, this.speed, loc);
        projectile.id = id;
        return projectile;
    }
}
exports.Weapon = Weapon;
class PistolWeapon extends Weapon {
    constructor() {
        super("images/pistol.png", 20, 50, 50, 25);
    }
}
exports.PistolWeapon = PistolWeapon;
class SniperWeapon extends Weapon {
    constructor() {
        super("images/sniper.png", 40, 100, 80, 40);
    }
}
exports.SniperWeapon = SniperWeapon;
class MachinegunWeapon extends Weapon {
    constructor() {
        super("images/smg.png", 5, 25, 50, 25);
    }
}
exports.MachinegunWeapon = MachinegunWeapon;
class ShotgunWeapon extends Weapon {
    constructor() {
        super("images/shotgun.png", 50, 75, 25, 30);
    }
}
exports.ShotgunWeapon = ShotgunWeapon;
