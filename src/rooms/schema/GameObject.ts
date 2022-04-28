import { Schema, Context, type } from "@colyseus/schema";

// abstract game object class
// can be tank, obstacle, projectile or weapon
export abstract class GameObject extends Schema {
    constructor (imagePath: string, height: number, width: number) {
        super();
        this.imagePath = imagePath;
        this.height = height;
        this.width = width;
    }

    abstract getType(): string;

    // 
    @type("number") height: number;
    @type("number") width: number;
    @type("number") direction: number = 0;
    @type("string") id: string;
    @type("string") imagePath: string;

}   

