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