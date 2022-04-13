import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";

export class Projectile extends GameObject {
    rangeRemaining: number;
    damage: number;
    direction: number;
    speed: number;
    tank_id: string;

    constructor(tank_id: string, damage: number, direction: number, range: number, speed: number) {
        super("images/projectile.png", 1, 1);
        this.tank_id = tank_id;
        this.damage = damage;
        this.direction = direction;
        this.rangeRemaining = range;
        this.speed = speed;
    }

    getType(): string {
        return "projectile";
    }
}