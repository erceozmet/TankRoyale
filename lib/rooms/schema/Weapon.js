"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shotgun = exports.SubmachineGun = exports.Sniper = exports.Pistol = exports.Weapon = void 0;
const GameObject_1 = require("./GameObject");
const Projectile_1 = require("./Projectile");
class Weapon extends GameObject_1.GameObject {
    constructor(name, image, damage, fire_rate, range, speed) {
        super(image, 3, 3);
        this.fireCountdown = 0;
        this.name = name;
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
class Pistol extends Weapon {
    constructor() {
        super("Pistol", "images/pistol.png", 20, 50, 50, 25);
    }
}
exports.Pistol = Pistol;
class Sniper extends Weapon {
    constructor() {
        super("Sniper", "images/sniper.png", 30, 100, 80, 40);
    }
}
exports.Sniper = Sniper;
class SubmachineGun extends Weapon {
    constructor() {
        super("Submachine Gun", "images/smg.png", 10, 25, 50, 25);
    }
}
exports.SubmachineGun = SubmachineGun;
class Shotgun extends Weapon {
    constructor() {
        super("Shotgun", "images/shotgun.png", 40, 75, 25, 30);
    }
}
exports.Shotgun = Shotgun;
