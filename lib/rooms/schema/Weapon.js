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
    static weapon_factory(name) {
        switch (name) {
            case 'shotgun':
                return new Shotgun();
            case 'pistol':
                return new Pistol();
            case 'smg':
                return new SubmachineGun();
            case 'sniper':
                return new Sniper();
            default:
                return new Shotgun();
        }
    }
    // place good weapons in hard to reach spots
    static static_weapons() {
        // type, x, y
        let weapons = [
            ["shotgun", 125, 130],
            ["smg", 5, 5],
            ["sniper", 55, 35],
            ["sniper", 75, 35],
            ["shotgun", 69, 45],
            ["shotgun", 5, -5],
            ["sniper", 28, -60],
            ["smg", -20, 18],
            ["smg", -75, 65],
            ["sniper", -25, -35],
            ["smg", -50, -5],
            ["shotgun", -3, -3],
            ["sniper", -75, -85],
            ["smg", -30, -30],
            ["shotgun", 120, -30],
        ];
        return weapons;
    }
}
exports.Weapon = Weapon;
class Pistol extends Weapon {
    constructor() {
        super("Pistol", "images/pistol.png", 15, 50, 50, 25);
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
        super("Shotgun", "images/shotgun.png", 50, 75, 25, 30);
    }
}
exports.Shotgun = Shotgun;
