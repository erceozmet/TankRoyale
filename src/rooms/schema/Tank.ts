import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
export class Tank extends GameObject {
    @type("number") health_count: number;
    @type("number") direction: number;
    @type("number") gun_damage: number;
    @type("number") gun_fire_rate: number;
    @type("number") gun_range: number;
    @type("number") gun_speed: number;
}
