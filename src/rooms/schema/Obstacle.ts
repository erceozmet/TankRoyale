import { type } from "@colyseus/schema";
import { Client } from "colyseus";
import { GameObject } from "./GameObject";
import { PistolWeapon, Weapon } from "./Weapon";

export class Obstacle extends GameObject {

    constructor(height: number, width: number) {
        super("images/black.png", height, width);
        
    }

    getType(): string {
        return "obstacle";
    }

}
