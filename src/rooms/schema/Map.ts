import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";

class Location extends Schema {
    @type("number") x: number = -1;
    @type("number") y: number = -1;
}

class Tiles<T> extends ArraySchema<T> {
    width: number;
    height: number;

    constructor() {
        super();
        this.width = 100;
        this.height = 100;
    };

    checkRange(i: number, j: number) {
        if (i < 0 && i >= this.width && j < 0 && j >= this.height)
            throw RangeError();
    }

    get(i: number, j: number): T {
        this.checkRange(i, j);
        let x = i + this.width * j;
        return this[x];
    }

    set(i: number, j: number, obj: T) {
        this.checkRange(i, j);
        this[i + this.width * j] = obj;
    }
}

export class Map extends Schema {

    @type({ map: Location }) game_object_locs = new MapSchema<Location>();
    @type([GameObject]) tiles = new Tiles<GameObject>();
}
