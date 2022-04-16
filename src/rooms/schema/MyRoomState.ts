import { Schema, ArraySchema, MapSchema, Context, type } from "@colyseus/schema";
import { GameMap } from "./GameMap";

export class MyRoomState extends Schema {
    @type(GameMap) map: GameMap = new GameMap();
    @type("number") player_count: number = 0;
    player_size: number = 2;
    
}
