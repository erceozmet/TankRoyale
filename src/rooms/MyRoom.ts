import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { GameMap } from "./schema/GameMap";
import { Tank } from "./schema/Tank";
import { SniperWeapon, MachinegunWeapon, ShotgunWeapon } from "./schema/Weapon";

export class MyRoom extends Room<MyRoomState> {
   
    client_to_tank = new Map();
    player_locations = [[20, 20], [20, 40], [20, 60], [20, 80], 
                        [40, 20], [40, 40], [40, 60], [40, 80],
                        [60, 20], [60, 40], [60, 60], [60, 80],
                        [80, 20], [80, 40], [80, 60], [80, 80],]
    // player_locations= [] //ToDo, add fix player locations
    
    initializeMap(map: GameMap) {
        // drop 3 of each special weapon on random coordinates
        let count = 3;
        for (let i = 0; i < count; i++) {
            let weapons = [new SniperWeapon(), new MachinegunWeapon(), new ShotgunWeapon()];
            weapons.forEach(function (weapon) {
                let x, y;
                do {
                    x = Math.floor(Math.random() * 100);
                    y = Math.floor(Math.random() * 100);
                } while (!map.isTileEmpty(x, y));

                map.put(x, y, weapon);
            });
        }
    }
    
    onCreate (options: any) {


        this.setState(new MyRoomState());
        this.maxClients = this.state.player_size;
        this.initializeMap(this.state.map);
        this.state.player_count = 0;

        this.onMessage("button", (client, button) => {
            console.log("MyRoom received button from", client.sessionId, ":", button);
            this.broadcast("buttons", `(${client.sessionId}) ${button}`);
        });


    }



    onJoin (client: Client, options: any) {
        this.state.player_count += 1
        let start_index = Math.floor(Math.random() * (this.player_locations.length -1));
        let start_location = this.player_locations[start_index];
        this.player_locations.splice(start_index, 1);
        let tank = new Tank(1);
        let tank_id = this.state.map.put(start_location[0], start_location[1], tank);
        
        this.client_to_tank.set(client.sessionId, tank_id);
        console.log(client.sessionId, "added to client addresses");
        console.log("Player count is: ", this.state.player_count)
    }

    onLeave (client: Client, consented: boolean) {
        
        let tank_id = this.client_to_tank.get(client.sessionId)
        this.state.player_count -= 1
        if (tank_id != null){
            this.client_to_tank.delete(client.sessionId)
            console.log("User:", client.sessionId, "and its tank", tank_id, "has left the game room")
        }
        else{
            console.log("User ", client.sessionId, " has left the game room")
        }

        console.log("Player count is: ", this.state.player_count)
        

    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}
