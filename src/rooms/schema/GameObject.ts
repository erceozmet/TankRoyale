import { Schema, Context, type } from "@colyseus/schema";

export class GameObject extends Schema {
    constructor(object_id: string){
        super();
        this.object_id = object_id;
    }
    @type("string") object_id: string;
}   

