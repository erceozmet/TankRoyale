import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
import { Location } from "./GameMap";

export class Projectile extends GameObject {
    rangeRemaining: number;
    damage: number;
    
    tank_id: string;

    @type("number") speed: number;
    @type("number") direction: number;
    @type("number") initial_col: number;
    @type("number") initial_row: number;
    col: number;
    row: number;

    constructor(tank_id: string, damage: number, direction: number, range: number, speed: number, loc: Location) {
        super("images/projectile.png", 1, 1);
        this.tank_id = tank_id;
        this.damage = damage;
        this.direction = direction;
        this.rangeRemaining = range;
        this.speed = speed;
        this.col = loc.col;
        this.row = loc.row;
        this.initial_col = loc.col;
        this.initial_row = loc.row;
    }

    getType(): string {
        return "projectile";
    }
}
