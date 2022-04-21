import { Schema, Context, type } from "@colyseus/schema";

export abstract class GameObject extends Schema {
    constructor (imagePath: string, height: number, width: number) {
        super();
        this.imagePath = imagePath;
        this.height = height;
        this.width = width;
    }

    abstract getType(): string;

    @type("number") height: number;
    @type("number") width: number;
    @type("number") direction: number = 0;
    @type("string") id: string;
    @type("string") imagePath: string;

}   

