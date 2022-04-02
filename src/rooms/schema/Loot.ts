import { Schema, ArraySchema, Context, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";

export class Loot extends GameObject {
    constructor (object_id: string, dmg: number, fire_rate: number, range: number, speed: number) {
        super(object_id);
        this.new_damage = dmg;
        this.new_fire_rate = fire_rate;
        this.new_range = range;
        this.new_speed = speed;
    }

    @type("number") new_damage: number;
    @type("number") new_fire_rate: number;
    @type("number") new_range: number;
    @type("number") new_speed: number;
}
