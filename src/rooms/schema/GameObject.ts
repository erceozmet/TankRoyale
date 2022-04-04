import { Schema, Context, type } from "@colyseus/schema";

export class GameObject extends Schema {
    constructor (imagePath: string) {
        super();
        this.imagePath = imagePath;
    }
    @type("string") id: string;
    @type("string") imagePath: string;
}   

