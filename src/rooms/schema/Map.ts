import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";

class Location extends Schema {
    @type("number") x: number = -1;
    @type("number") y: number = -1;
}

export class Map extends Schema {
    @type({ map: Location }) game_object_locs = new MapSchema<Location>();
    @type([GameObject]) game_map = new ArraySchema<ArraySchema<GameObject>>();
}
