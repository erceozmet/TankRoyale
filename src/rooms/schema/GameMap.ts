import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";

export class Location extends Schema {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
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

export class GameMap extends Schema {
    uniqueId: number = 0;

    @type({ map: Location }) locations = new MapSchema<Location>();
    @type([ GameObject ]) tiles = new Tiles<GameObject>();

    getUniqueId(): string {
        this.uniqueId++;
        return this.uniqueId.toString();
    }

    get_by_id(id: string): GameObject {
        let loc = this.locations.get(id);
        return this.tiles.get(loc.x, loc.y);
    }

    get_by_loc(x: number, y: number): GameObject {
        return this.tiles.get(x, y);
    }
    
    put(x: number, y: number, obj: GameObject): string {
        obj.id = this.getUniqueId();
        this.tiles.set(x, y, obj);
        this.locations.set(obj.id, new Location(x, y));
        return obj.id;
    }

    isTileEmpty(x: number, y: number): boolean {
        return this.tiles.get(x, y) == null;
    }
}
