import { type } from "@colyseus/schema";
import { GameObject } from "./GameObject";
import { PistolWeapon, Weapon } from "./Weapon";

export class Tank extends GameObject {

    constructor(client: string) {
        super("images/tank.png", 6, 6);
        this.client = client;
        this.health = 100;
        this.weapon = new PistolWeapon();
    }

    getType(): string {
        return "tank";
    }

    client: string;
    @type("number") health: number;
    @type(Weapon) weapon: Weapon;
}
