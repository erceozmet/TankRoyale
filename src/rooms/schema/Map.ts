import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";

export class Map extends Schema {
    @type("number") object_id: number;
    @type({ map: GameObject }) game_objects = new MapSchema<GameObject>();
    @type([GameObject]) game_map = new ArraySchema<ArraySchema<GameObject>>();
    
}