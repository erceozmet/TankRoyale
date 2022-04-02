"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loot = void 0;
const schema_1 = require("@colyseus/schema");
const GameObject_1 = require("./GameObject");
class Loot extends GameObject_1.GameObject {
}
__decorate([
    schema_1.type("number")
], Loot.prototype, "new_damage", void 0);
__decorate([
    schema_1.type("number")
], Loot.prototype, "new_fire_rate", void 0);
__decorate([
    schema_1.type("number")
], Loot.prototype, "new_range", void 0);
__decorate([
    schema_1.type("number")
], Loot.prototype, "new_speed", void 0);
exports.Loot = Loot;
