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
        if (this.checkRange(col, row)) {
            return this[col + this.width * row];
        }
        else {
            return null;
        }
    }
    set(col, row, obj) {
        if (this.checkRange(col, row)) {
            this[col + this.width * row] = obj;
        }
    }
    remove(col, row) {
        if (this.checkRange(col, row)) {
            this[col + this.width * row] = null;
        }
    }
}
class GameMap extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.uniqueId = 0;
        this.width = 1000;
        this.height = 1000;
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
    canPlace(col, row, obj) {
        return (this.tiles.checkRange(col, row) &&
            this.tiles.checkRange(col + obj.width, row + obj.height));
    }
    getUniqueId() {
        return (this.uniqueId++).toString();
    }
    put(obj, col, row) {
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
    moveTank(id, right, up) {
        let loc = this.locations.get(id);
        let obj = this.tiles.get(loc.col, loc.row);
        return this.setLoc(obj, loc.col, loc.row, loc.col + right, loc.row + up);
    }
    setLoc(tank, old_col, old_row, col, row) {
        if (!this.canPlace(col, row, tank))
            return false;
        for (let i = 0; i < tank.width; i++) {
            for (let j = 0; j < tank.height; j++) {
                // console.log("checking square", col+ i, row+j);
                let prev_obj = this.tiles.get(col + i, row + j);
                if (prev_obj == null)
                    continue;
                if (prev_obj.getType() == "weapon") {
                    console.log("weapon picked up");
                    tank.weapon = prev_obj;
                    this.delete(prev_obj.id);
                }
                else if (prev_obj.getType() == "tank" && prev_obj != tank) {
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
    explodeProjectile(projectile, loc) {
        // let loc = this.locations.get(projectile.id);
        console.log("projectile exploded in", loc.col, loc.row);
        let index = this.projectiles.indexOf([projectile, loc]);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
        // this.locations.delete(projectile.id);
    }
    explodeTank(tank) {
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
__decorate([
    schema_1.type("number")
], GameMap.prototype, "width", void 0);
__decorate([
    schema_1.type("number")
], GameMap.prototype, "height", void 0);
__decorate([
    schema_1.type({ map: GameObject_1.GameObject })
], GameMap.prototype, "synced_tiles", void 0);
__decorate([
    schema_1.type([Projectile_1.Projectile])
], GameMap.prototype, "projectiles", void 0);
exports.GameMap = GameMap;
