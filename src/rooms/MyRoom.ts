import { Room, Client } from "colyseus";
import { ArraySchema } from "@colyseus/schema";
import { MyRoomState } from "./schema/MyRoomState";
import { Map } from "./schema/Map";
import { Loot } from "./schema/Loot";
import { GameObject } from "./schema/GameObject";

export class MyRoom extends Room<MyRoomState> {
    uniqueId: number;

    initializeMap(map: Map) {
        // this.uniqueId = 0;

        // let loot1 = new Loot(this.uniqueId.toString(), 1, 1, 1, 1);
    
        // for (let i = 0; i < 100; i++) {
        //     map.game_map.push(new ArraySchema<GameObject>());
        //     for (let j = 0; j< 100; j++){
        //         // map.game_map[i].push(null); // TODO
        //     }
        // } 
        // map.game_map[0][0] = loot1;
        // console.log(map.game_map[0][0]);
        // map.game_object_locs.set(loot1.object_id, loot1);
        
    }

    onCreate (options: any) {
        this.setState(new MyRoomState());
        this.initializeMap(this.state.map)
        this.onMessage("button", (client, button) => {
            console.log("MyRoom received button from", client.sessionId, ":", button);
    
            this.broadcast("buttons", `(${client.sessionId}) ${button}`);
        });
    }



    onJoin (client: Client, options: any) {
        this.state.client_addresses.push(client.sessionId)
        console.log(client.sessionId, "joined!");
    }

    onLeave (client: Client, consented: boolean) {
        for (let i = 0; i < this.state.client_addresses.length; i++){
        if (this.state.client_addresses[i] == client.sessionId){
            this.state.client_addresses.splice(i, 1)
            console.log(client.sessionId, "left!");
        }
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}
