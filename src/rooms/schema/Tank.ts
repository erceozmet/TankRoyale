import { type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
import { PistolWeapon, Weapon } from "./Weapon";

export class Tank extends GameObject {
    constructor(direction: number) {
        super("images/tank.png");
        this.health = 100;
        this.weapon = new PistolWeapon();
        this.direction = direction;
    }
    
    @type("number") health: number;
    @type("number") direction: number;
    @type(Weapon) weapon: Weapon;
}
