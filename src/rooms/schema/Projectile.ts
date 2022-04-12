import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";

export class Projectile extends GameObject {
    rangeRemaining: number;
    damage: number;
    direction: number;
    speed: number;
    

    @type("number") tank_id: number;

    constructor(damage: number, direction: number, range: number, speed: number) {
        super("images/projectile.png", 1, 1);
        this.damage = damage;
        this.direction = direction;
        this.rangeRemaining = range;
        this.speed = speed;
    }

    getType(): string {
        return "projectile";
    }
}