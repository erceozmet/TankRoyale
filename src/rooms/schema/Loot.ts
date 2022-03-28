import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
export class Loot extends GameObject {
    @type("number") new_damage: number;
    @type("number") new_fire_rate: number;
    @type("number") new_range: number;
    @type("number") new_speed: number;
}
