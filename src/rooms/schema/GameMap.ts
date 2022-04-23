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
    width: number = 250;
    height: number = 250;

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
        let obj = this.tiles.get(loc.col, loc.row);

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

    checkSquareForMove(tank: Tank, col: number, row: number): boolean {
        let prev_obj = this.tiles.get(col, row);
        if (prev_obj == null) return true;
        if (prev_obj.getType() == "weapon") {
            tank.weapon = prev_obj as Weapon;
            tank.client.send("new_weapon", { name: tank.weapon.name, imagePath: tank.weapon.imagePath } );
            this.delete(prev_obj.id);
        } else if (prev_obj.getType() == "tank") {
            return false;
        } else if (prev_obj.getType() == "obstacle" ) {
            return false;
        }
        return true;
    }

    moveTank(id: string, right: number, up: number): boolean {
        let loc = this.locations.get(id);
        let tank = this.tiles.get(loc.col, loc.row) as Tank;
        let old_col = loc.col;
        let old_row = loc.row;
        let col = loc.col + right;
        let row = loc.row + up;
    
        if (!this.checkObjectRange(col, row, tank)) return false;

        let goingUp = up > 0;
        let goingRight = right > 0;

        let min_row_check = goingUp ? old_row + tank.height : row;
        let max_row_check = goingUp ? row + tank.height : old_row;
        let min_col_check = goingRight ? old_col + tank.width : col;
        let max_col_check = goingRight ? col + tank.width : old_col;

        // check squares in the vertical displacement area
        for (let i = col; i < col + tank.width; i++) {
            for (let j = min_row_check; j < max_row_check; j++) {
                if (!this.checkSquareForMove(tank, i, j)) return false;
            }
        }
        
        // check squares in the horizontal displacement area
        for (let i = min_col_check; i < max_col_check; i++) {
            for (let j = row; j < row + tank.height; j++) {
                if (!this.checkSquareForMove(tank, i, j)) return false;
            }
        }

        let min_row_null = goingUp ? old_row : row + tank.height;
        let max_row_null = goingUp ? row : old_row + tank.height;
        let min_col_null = goingRight ? old_col : col + tank.width;
        let max_col_null = goingRight ? col : old_col + tank.width;

        // set squares to null in the vertical displacement area
        for (let i = old_col; i < old_col + tank.width; i++) {
            for (let j = min_row_null; j < max_row_null; j++) {
                this.tiles.remove(i, j);
            }
        }

        // set squares to null in the horizontal displacement area
        for (let i = min_col_null; i < max_col_null; i++) {
            for (let j = old_row; j < old_row + tank.height; j++) {
                this.tiles.remove(i, j);
            }
        }

        // set squares to object in the vertical displacement area
        for (let i = col; i < col + tank.width; i++) {
            for (let j = min_row_check; j < max_row_check; j++) {
                this.tiles.set(i, j, tank);
            }
        }
        
        // check squares in the horizontal displacement area
        for (let i = min_col_check; i < max_col_check; i++) {
            for (let j = row; j < row + tank.height; j++) {
                this.tiles.set(i, j, tank);
            }
        }

        let direction = Math.atan2(up, right); // angle in radians
        if (direction == tank.last_direction) {
            tank.direction = direction;
        }
        tank.last_direction = direction;
        this.synced_tiles.delete(this.to1D(old_col, old_row));
        this.synced_tiles.set(this.to1D(col, row), tank);

        loc.col = col;
        loc.row = row;
        return true;
    }

    explodeProjectile(projectile: Projectile) {
        let col = projectile.col;
        let row = projectile.row;

        let index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
    }

}
