"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMap = exports.Location = void 0;
const schema_1 = require("@colyseus/schema");
const GameObject_1 = require("./GameObject");
const Projectile_1 = require("./Projectile");
class Location extends schema_1.Schema {
    constructor(col, row) {
        super();
        this.col = col;
        this.row = row;
    }
}
exports.Location = Location;
class Tiles extends schema_1.ArraySchema {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }
    checkRange(col, row) {
        return col >= 0 && col < this.width && row >= 0 && row < this.height;
    }
    get(col, row) {
        return this[col + this.width * row];
    }
    set(col, row, obj) {
        this[col + this.width * row] = obj;
    }
    remove(col, row) {
        this[col + this.width * row] = null;
    }
}
class GameMap extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.uniqueId = 0;
        this.width = 250;
        this.height = 250;
        this.locations = new schema_1.MapSchema();
        this.tiles = new Tiles(this.width, this.height);
        this.synced_tiles = new schema_1.MapSchema();
        this.projectiles = new schema_1.ArraySchema();
    }
    to1D(col, row) {
        return (col + this.width * row).toString();
    }
    checkRange(col, row) {
        return this.tiles.checkRange(col, row);
    }
    checkObjectRange(col, row, obj) {
        return (this.tiles.checkRange(col, row) &&
            this.tiles.checkRange(col + obj.width, row + obj.height));
    }
    canPlace(col, row, obj) {
        for (let i = 0; i < obj.width; i++) {
            for (let j = 0; j < obj.height; j++) {
                if (this.tiles.get(col + i, row + j) != null)
                    return false;
            }
        }
        return this.checkObjectRange(col, row, obj);
    }
    get(id) {
        let loc = this.locations.get(id);
        return this.tiles.get(loc.col, loc.row);
    }
    at(col, row) {
        return this.tiles.get(col, row);
    }
    delete(id) {
        let loc = this.locations.get(id);
        let obj = this.tiles.get(loc.col, loc.row);
        for (let i = 0; i < obj.width; i++) {
            for (let j = 0; j < obj.height; j++) {
                this.tiles.remove(loc.col + i, loc.row + j);
            }
        }
        this.synced_tiles.delete(this.to1D(loc.col, loc.row));
    }
    getUniqueId() {
        return (this.uniqueId++).toString();
    }
    put(obj, col, row) {
        obj.id = this.getUniqueId();
        console.log("put ", obj.getType(), "to ", col, row);
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
    moveTank(id, right, up) {
        let loc = this.locations.get(id);
        let obj = this.tiles.get(loc.col, loc.row);
        return this.setLoc(obj, loc.col, loc.row, loc.col + right, loc.row + up);
    }
    checkSquareForMove(tank, col, row) {
        let prev_obj = this.tiles.get(col, row);
        if (prev_obj == null)
            return true;
        if (prev_obj.getType() == "weapon") {
            console.log("weapon picked up");
            tank.weapon = prev_obj;
            tank.client.send("new_weapon", [tank.weapon.damage, tank.weapon.fire_rate, tank.weapon.range, tank.weapon.speed]);
            this.delete(prev_obj.id);
        }
        else if (prev_obj.getType() == "tank") {
            return false;
        }
        else if (prev_obj.getType() == "obstacle") {
            return false;
        }
        return true;
    }
    setLoc(tank, old_col, old_row, col, row) {
        if (!this.checkObjectRange(col, row, tank))
            return false;
        let goingUp = (row - old_row) > 0;
        let goingRight = (col - old_col) > 0;
        let min_row_check = goingUp ? old_row + tank.height : row;
        let max_row_check = goingUp ? row + tank.height : old_row;
        let min_col_check = goingRight ? old_col + tank.width : col;
        let max_col_check = goingRight ? col + tank.width : old_col;
        // check squares in the vertical displacement area
        for (let i = col; i < col + tank.width; i++) {
            for (let j = min_row_check; j < max_row_check; j++) {
                if (!this.checkSquareForMove(tank, i, j))
                    return false;
            }
        }
        // check squares in the horizontal displacement area
        for (let i = min_col_check; i < max_col_check; i++) {
            for (let j = row; j < row + tank.height; j++) {
                if (!this.checkSquareForMove(tank, i, j))
                    return false;
            }
        }
        console.log("moving tank", tank.id, "from", old_col, old_row, "to", col, row);
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
        this.synced_tiles.delete(this.to1D(old_col, old_row));
        this.synced_tiles.set(this.to1D(col, row), tank);
        let loc = this.locations.get(tank.id);
        loc.col = col;
        loc.row = row;
        return true;
    }
    explodeProjectile(projectile) {
        let col = projectile.col;
        let row = projectile.row;
        console.log("projectile exploded in", col, row);
        let index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
    }
}
__decorate([
    schema_1.type({ map: GameObject_1.GameObject })
], GameMap.prototype, "synced_tiles", void 0);
__decorate([
    schema_1.type([Projectile_1.Projectile])
], GameMap.prototype, "projectiles", void 0);
exports.GameMap = GameMap;
