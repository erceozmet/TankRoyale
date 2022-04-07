import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
import { Projectile } from "./Projectile";
import { Tank } from "./Tank";
import { Weapon } from "./Weapon";

class Location extends Schema {
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

    constructor(width: number, height: number) {
        super();
        this.width = width;
        this.height = height;
    }

    checkRange(i: number, j: number): boolean {
        return i >= 0 && i < this.width && j >= 0 && j < this.height;
    }

    get(i: number, j: number): T {
        if (this.checkRange(i, j)) {
            return this[i + this.width * j];
        } else {
            return null;
        }
    }

    set(i: number, j: number, obj: T) {
        if (this.checkRange(i, j)) {
            this[i + this.width * j] = obj;
        }
    }

    remove(i: number, j: number) {
        this.splice(i + this.width * j);
    }
}

export class GameMap extends Schema {
    uniqueId: number = 0;
    @type("number") width: number = 100;
    @type("number") height: number = 100;

    locations = new MapSchema<Location>();
    tiles: Tiles<GameObject> = new Tiles<GameObject>(this.width, this.height);
    @type({ map: GameObject }) synced_tiles = new MapSchema<GameObject>();

    to1D(x: number, y: number): string {
        return (x + this.width * y).toString();
    }

    get(id: string): GameObject {
        let loc = this.locations.get(id);
        return this.tiles.get(loc.x, loc.y);
    }

    canPlace(x: number, y: number, obj: GameObject): boolean {
        return (
            this.tiles.checkRange(x, y) &&
            this.tiles.checkRange(x + obj.width, y + obj.height)
        );
    }

    put(obj: GameObject, x: number, y: number): string {
        obj.id = (this.uniqueId++).toString();

        for (let i = 0; i < obj.height; i++) {
            for (let j = 0; j < obj.width; j++) {
                if (this.tiles.get(x + i, y + j) != null) {
                    throw Error(`Tried to place object: ${obj.id}, but there is already an object: ${this.tiles.get(x + i, y + j)} at: ${x}, ${y}`);
                }
                this.tiles.set(x + i, y + j, obj);
            }
        }
        this.synced_tiles.set(this.to1D(x, y), obj);
        this.locations.set(obj.id, new Location(x, y));
        return obj.id;
    }

    moveTank(id: string, right: number, up: number): boolean {
        let loc = this.locations.get(id);
        let obj = this.tiles.get(loc.x, loc.y) as Tank;

        return this.setLoc(obj, loc.x, loc.y, loc.x + right, loc.y + up);
    }

    setLoc(tank: Tank, old_x: number, old_y: number, x: number, y: number): boolean {
        if (!this.canPlace(x, y, tank)) return false;

        for (let i = 0; i < tank.height; i++) {
            for (let j = 0; j < tank.width; j++) {
                let prev_obj = this.tiles.get(x + i, y + j);
                if (prev_obj == null) continue;
                if (prev_obj.getType() == "weapon") {
                    tank.weapon = prev_obj as Weapon;
                    this.tiles.remove(x + i, y + j);
                } else if (prev_obj.getType() == "tank" && prev_obj != tank) {
                    return false;
                }
            }
        }

        for (let i = 0; i < tank.height; i++) {
            for (let j = 0; j < tank.width; j++) {
                this.tiles.remove(old_x + i, old_y + j);
            }
        }

        for (let i = 0; i < tank.height; i++) {
            for (let j = 0; j < tank.width; j++) {
                this.tiles.set(x + i, y + j, tank);
            }
        }

        this.synced_tiles.delete(this.to1D(old_x, old_y));
        this.synced_tiles.set(this.to1D(x, y), tank);
        let loc = this.locations.get(tank.id);
        loc.x = x;
        loc.y = y;
        return true;
    }
}
