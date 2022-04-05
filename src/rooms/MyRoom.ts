import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { GameMap } from "./schema/GameMap";
import { Tank } from "./schema/Tank";
import { SniperWeapon, MachinegunWeapon, ShotgunWeapon } from "./schema/Weapon";

export class MyRoom extends Room<MyRoomState> {
    client_to_tank = new Map();
    // player_locations= [] //ToDo, add fix player locations
    
    initializeMap(map: GameMap) {
        // drop 3 of each special weapon on random coordinates
        let count = 3;
        for (let i = 0; i < count; i++) {
            let weapons = [new SniperWeapon(), new MachinegunWeapon(), new ShotgunWeapon()];
            weapons.forEach(function (weapon) {
                let x, y;
                do {
                    x = Math.random() * 100;
                    y = Math.random() * 100;
                } while (!map.isTileEmpty(x, y));

                map.put(x, y, weapon);
            });
        }
    }
    
    onCreate (options: any) {
        this.setState(new MyRoomState());
        this.initializeMap(this.state.map);


        this.onMessage("button", (client, button) => {
            console.log("MyRoom received button from", client.sessionId, ":", button);
            this.broadcast("buttons", `(${client.sessionId}) ${button}`);
        });
    }



    onJoin (client: Client, options: any) {
        let x = 5;
        let y = 5;
        let tank = new Tank(1);
        let tank_id = this.state.map.put(x, y, tank);

        this.client_to_tank.set(client.sessionId, tank_id);
        console.log(client.sessionId, "added to client addresses");
    }

    onLeave (client: Client, consented: boolean) {
        // for (let i = 0; i < this.state.client_addresses.length; i++){
        //     if (this.state.client_addresses[i] == client.sessionId){
        //         this.state.client_addresses.splice(i, 1)
        //         console.log(client.sessionId, "removed from client addresses");
        //     }
        // }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}
