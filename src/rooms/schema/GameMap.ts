import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
import { Projectile } from "./Projectile";
import { Tank } from "./Tank";
import { Weapon } from "./Weapon";

export class Location extends Schema {
    col: number;
    row: number;

    constructor(col: number, row: number) {
        super();
        this.col = col;
        this.row = row;
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

    checkRange(col: number, row: number): boolean {
        return col >= 0 && col < this.width && row >= 0 && row < this.height;
    }

    get(col: number, row: number): T {
        return this[col + this.width * row];
    }

    set(col: number, row: number, obj: T) {
        this[col + this.width * row] = obj;
    }

    remove(col: number, row: number) {
        this[col + this.width * row] = null;
    }
}

export class GameMap extends Schema {
    uniqueId: number = 0;
    @type("number") width: number = 1000;
    @type("number") height: number = 1000;

    locations = new MapSchema<Location>();
    tiles: Tiles<GameObject> = new Tiles<GameObject>(this.width, this.height);
    @type({ map: GameObject }) synced_tiles = new MapSchema<GameObject>();
    @type([ Projectile ]) projectiles = new ArraySchema<Projectile>();

    to1D(col: number, row: number): string {
        return (col + this.width * row).toString();
    }

    checkRange(col: number, row: number): boolean {
        return this.tiles.checkRange(col, row);
    }

    checkObjectRange(col: number, row: number, obj: GameObject): boolean {
        return (
            this.tiles.checkRange(col, row) &&
            this.tiles.checkRange(col + obj.width, row + obj.height)
        );
    }

    canPlace(col: number, row: number, obj: GameObject): boolean {
        for (let i = 0; i < obj.width; i++) {
            for (let j = 0; j < obj.height; j++) {
                if (this.tiles.get(col + i, row + j) != null)
                    return false;
            }
        }
        return this.checkObjectRange(col, row, obj);
    }

    get(id: string): GameObject {
        let loc = this.locations.get(id);
        return this.tiles.get(loc.col, loc.row);
    }

    at(col: number, row: number): GameObject {
        return this.tiles.get(col, row);
    }

    delete(id: string) {
        let loc = this.locations.get(id);
        let obj = this.tiles.get(loc.col, loc.row) as Tank;

        for (let i = 0; i < obj.width; i++){
            for (let j = 0; j < obj.height; j++){
                this.tiles.remove(loc.col + i, loc.row + j);
            }
        }

        this.synced_tiles.delete(this.to1D(loc.col, loc.row));
    }



    getUniqueId(): string {
        return (this.uniqueId++).toString()
    }

    put(obj: GameObject, col: number, row: number): string {
        obj.id = this.getUniqueId();
        console.log("put Weapon to, ", col, row);
        for (let i = 0; i < obj.width; i++) {
            for (let j = 0; j < obj.height; j++) {
                if (this.tiles.get(col + i, row + j) != null) {
                    throw Error(`Tried to place object: ${obj.id}, but there is already an object: ${this.tiles.get(col + i, row + j)} at: ${col}, ${row}`);
                }
                this.tiles.set(col + i, row + j, obj);
            }
        }
        this.synced_tiles.set(this.to1D(col, row), obj);
        this.locations.set(obj.id, new Location(col, row));
        return obj.id;
    }

    moveTank(id: string, right: number, up: number): boolean {
        let loc = this.locations.get(id);
        let obj = this.tiles.get(loc.col, loc.row) as Tank;

        return this.setLoc(obj, loc.col, loc.row, loc.col + right, loc.row + up);
    }

    setLoc(tank: Tank, old_col: number, old_row: number, col: number, row: number): boolean {
        if (!this.checkObjectRange(col, row, tank)) return false;

        for (let i = 0; i < tank.width; i++) {
            for (let j = 0; j < tank.height; j++) {
                // console.log("checking square", col+ i, row+j);
                let prev_obj = this.tiles.get(col + i, row + j);
                if (prev_obj == null) continue;
                if (prev_obj.getType() == "weapon") {
                    console.log("weapon picked up");
                    tank.weapon = prev_obj as Weapon;
                    this.delete(prev_obj.id);
                } else if (prev_obj.getType() == "tank" && prev_obj != tank) {
                    return false;
                }
            }
        }

        console.log("moving tank to ", col, row);
        
        for (let i = 0; i < tank.width; i++) {
            for (let j = 0; j < tank.height; j++) {
                this.tiles.remove(old_col + i, old_row + j);
            }
        }

        for (let i = 0; i < tank.width; i++) {
            for (let j = 0; j < tank.height; j++) {
                this.tiles.set(col + i, row + j, tank);
            }
        }

        this.synced_tiles.delete(this.to1D(old_col, old_row));
        this.synced_tiles.set(this.to1D(col, row), tank);
        let loc = this.locations.get(tank.id);
        loc.col = col;
        loc.row = row;
        return true;
    }

    explodeProjectile(projectile: Projectile) {
        let col = projectile.col;
        let row = projectile.row;

        console.log("projectile exploded in", col, row);

        let index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
    }

    explodeTank(tank: Tank) {
        let loc = this.locations.get(tank.id);
        this.locations.delete(tank.id);
        
        for (let i = 0; i < tank.width; i++) {
            for (let j = 0; j < tank.height; j++) {
                this.tiles.remove(loc.col + i, loc.row + j);
            }
        }
        this.synced_tiles.delete(this.to1D(loc.col, loc.row));
    }
}
