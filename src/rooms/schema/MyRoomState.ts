import { Schema, ArraySchema, MapSchema, Context, type } from "@colyseus/schema";
import { Map } from "./Map";
export class MyRoomState extends Schema {
  @type(Map) map: Map = new Map();
  player_size:  number = 20;
  @type(["string"]) client_addresses = new ArraySchema<string>();
}
