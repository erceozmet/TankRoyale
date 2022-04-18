import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
import { Projectile } from "./Projectile";
import { Location } from "./GameMap";
import { Tank } from "./Tank";

export class Weapon extends GameObject {
    constructor (image: string, damage: number, fire_rate: number, range: number, speed: number) {
        super(image, 3, 3);
        this.damage = damage;
        this.fire_rate = fire_rate;
        this.range = range;
        this.speed = speed;
    }

    getType(): string {
        return "weapon";
    }

    fireCountdown: number = 0;
    @type("number") damage: number;
    @type("number") fire_rate: number;
    @type("number") range: number;
    @type("number") speed: number;

    shootProjectile(tank_id: string, direction: number, id: string, loc: Location): Projectile {
        let projectile = new Projectile(tank_id, this.damage, direction, this.range, this.speed, loc);
        projectile.id = id;
        return projectile;
    }
}

export class PistolWeapon extends Weapon {
    constructor() {
        super("images/pistol.png", 20, 50, 50, 25);
    }
}

export class SniperWeapon extends Weapon {
    constructor() {
        super("images/sniper.png", 40, 100, 80, 40);
    }
}

export class MachinegunWeapon extends Weapon{
    constructor() {
        super("images/smg.png", 5, 25, 50, 25);
    }
}

export class ShotgunWeapon extends Weapon{
    constructor() {
        super("images/shotgun.png", 50, 75, 25, 30);
    }
}