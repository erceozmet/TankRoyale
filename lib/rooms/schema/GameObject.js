"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObject = void 0;
const schema_1 = require("@colyseus/schema");
class GameObject extends schema_1.Schema {
    constructor(imagePath, height, width) {
        super();
        this.direction = 0;
        this.imagePath = imagePath;
        this.height = height;
        this.width = width;
    }
}
__decorate([
    schema_1.type("number")
], GameObject.prototype, "height", void 0);
__decorate([
    schema_1.type("number")
], GameObject.prototype, "width", void 0);
__decorate([
    schema_1.type("number")
], GameObject.prototype, "direction", void 0);
__decorate([
    schema_1.type("string")
], GameObject.prototype, "id", void 0);
__decorate([
    schema_1.type("string")
], GameObject.prototype, "imagePath", void 0);
exports.GameObject = GameObject;
