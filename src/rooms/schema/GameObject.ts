import { Schema, Context, type } from "@colyseus/schema";


export class GameObject extends Schema {
    @type("number") object_id: number;
    @type(["number", "number"]) size: [number, number];
}   

