import { Schema, ArraySchema, MapSchema, Context, type } from "@colyseus/schema";

export class MyRoomState extends Schema {
 

  map: Array<number>;
  

<<<<<<< Updated upstream
  player_size:  number = 20;
  // @type(["number"]) map = new ArraySchema<number>();
  @type(["number"]) mynum: number = 0;
  @type(["string"]) client_addresses = new ArraySchema<string>();
=======
  @type("string") mySynchronizedProperty: string = "Hello world";
  
>>>>>>> Stashed changes

}
