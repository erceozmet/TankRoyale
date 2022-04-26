import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
import { Projectile } from "./Projectile";
import { Location } from "./GameMap";
import { Tank } from "./Tank";

export class Weapon extends GameObject {
    constructor (name: string, image: string, damage: number, fire_rate: number, range: number, speed: number) {
        super(image, 3, 3);
        this.name = name;
        this.damage = damage;
        this.fire_rate = fire_rate;
        this.range = range;
        this.speed = speed;
    }

    getType(): string {
        return "weapon";
    }

    name: string;
    fireCountdown: number = 0;
    damage: number;
    fire_rate: number;
    range: number;
    speed: number;

    shootProjectile(tank_id: string, direction: number, id: string, loc: Location): Projectile {
        let projectile = new Projectile(tank_id, this.damage, direction, this.range, this.speed, loc);
        projectile.id = id;
        return projectile;
    }

    static weapon_factory(name: string) {
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
    static static_weapons()  {
        // type, x, y
        let weapons: [string, number, number][] = [
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

export class Pistol extends Weapon {
    constructor() {
        super("Pistol", "images/pistol.png", 15, 50, 50, 25);
    }
}

export class Sniper extends Weapon {
    constructor() {
        super("Sniper", "images/sniper.png", 30, 100, 80, 40);
    }
}

export class SubmachineGun extends Weapon{
    constructor() {
        super("Submachine Gun", "images/smg.png", 10, 25, 50, 25);
    }
}

export class Shotgun extends Weapon{
    constructor() {
        super("Shotgun", "images/shotgun.png", 50, 75, 25, 30);
    }
}