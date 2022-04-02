import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";

export class Projectile extends GameObject {
    @type("number") damage: number;
    @type("number") fire_rate: number;
    @type("number") range_left: number;
    @type("number") tank_id: number;
    @type("number") direction: number;
}