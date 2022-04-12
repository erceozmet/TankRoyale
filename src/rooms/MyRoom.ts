import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { GameMap, Location } from "./schema/GameMap";
import { Tank } from "./schema/Tank";
import { SniperWeapon, MachinegunWeapon, ShotgunWeapon } from "./schema/Weapon";

export class MyRoom extends Room<MyRoomState> {
   
    client_to_tank = new Map();
    client_to_buffer = new Map();

    // col row
    player_locations = [[20, 20], [20, 40], [20, 60], [20, 80], 
                        [40, 20], [40, 40], [40, 60], [40, 80],
                        [60, 20], [60, 40], [60, 60], [60, 80],
                        [80, 20], [80, 40], [80, 60], [80, 80]]


    
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

                    // toDo: handle tank and weapon collision at client join
                    // TODO: pressing A and D at the same time
                } while (!map.canPlace(x, y, weapon ));
                map.put(weapon, x, y);
            });
        }
    }

    update (deltaTime: any) {
        this.client_to_buffer.forEach((buffer, client) => {
            let tankId = this.client_to_tank.get(client);
            let tank = this.state.map.get(tankId) as Tank;
            if (tank.weapon.fireCountdown > 0) {
                tank.weapon.fireCountdown--;
            }

            if (buffer.length == 0) return;

            let up = 0;
            let right = 0;
            for (let i = 0; i < buffer.length; i++){
                console.log(buffer[i]);
                if (buffer[i] == "KeyW") up -= 1; 
                else if (buffer[i] == "KeyS") up += 1;
                else if (buffer[i] == "KeyD") right += 1;
                else if (buffer[i] == "KeyA") right -= 1;
                // else  if(buffer[i] == "KeySpace") 
            }
            if (Math.abs(up) + Math.abs(right) > 2){
                if (up > 1){
                    up = 1;
                }
                if (up < -1){
                    up = -1
                }
                if (right > 1){
                    right = 1
                }
                if (right < -1){
                    right = -1
                }
            }
            this.state.map.moveTank(tankId, right, up);
            this.client_to_buffer.set(client, []);
        });

        this.state.map.projectiles.forEach((projectile) => {
            let loc = this.state.map.locations.get(projectile.id);
            let distance = projectile.speed * deltaTime;

            let x_offset =  Math.round(loc.row + (Math.cos(projectile.direction) * distance));
            let y_offset =  Math.round(loc.col + (Math.sin(projectile.direction) * distance));

            let newLoc = new Location(x_offset, y_offset);

            console.log("oldLoc is,", loc.col, loc.row);
            console.log("newLoc is,", newLoc.col, newLoc.row);

            this.state.map.locations.set(projectile.id, newLoc);

            // if the projectile is out of range or collided, then explode
            projectile.rangeRemaining -= distance;
            let obj_at_newloc = this.state.map.at(newLoc.col, newLoc.row);
            if (projectile.rangeRemaining <= 0) {
                let index = this.state.map.projectiles.indexOf(projectile);
                if (index > -1) {
                    this.state.map.projectiles.splice(index, 1);
                }
                this.state.map.locations.delete(projectile.id);
            }
        });
    }
    
    onCreate (options: any) {
        this.setState(new MyRoomState());
        this.maxClients = this.state.player_size;
        this.initializeMap(this.state.map);
        this.state.player_count = 0;

        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
       
        this.onMessage("button", (client, button) => {
            this.client_to_buffer.get(client.sessionId).push(button);
            this.broadcast("buttons", `(${client.sessionId}) ${button}`);
        });

        this.onMessage("projectile", (client, barrelDirrection) => {
            let tank = this.state.map.get(this.client_to_tank.get(client.sessionId)) as Tank;
            let tankLoc = this.state.map.locations.get(tank.id);
            let weapon = tank.weapon;
            // POSSIBLY keep track of who shot who

            console.log(weapon.fireCountdown);
            if (weapon.fireCountdown == 0) {
                console.log("pushed");
                let projectile = weapon.shootProjectile(barrelDirrection, this.state.map.getUniqueId());
                this.state.map.projectiles.push(projectile);
                let projectileLoc = new Location(Math.round(tankLoc.col + tank.width / 2), Math.round(tankLoc.row + tank.height / 2));
                this.state.map.locations.set(projectile.id, projectileLoc);
                weapon.fireCountdown = weapon.fire_rate;
            }
        });
    }

    onJoin (client: Client, options: any) {
        this.state.player_count += 1;
        let start_index = Math.floor(Math.random() * (this.player_locations.length -1));
        let start_location = this.player_locations[start_index];
        this.player_locations.splice(start_index, 1);
        let tank = new Tank();

        
        let tank_id = this.state.map.put(tank, start_location[0], start_location[1]);
        
        client.send("tank_id", {tank_id, start_location});

        this.client_to_tank.set(client.sessionId, tank_id);
        this.client_to_buffer.set(client.sessionId, new Array());
        console.log(client.sessionId, "added to client addresses");
        console.log("Player count is: ", this.state.player_count);
    }

    onLeave (client: Client, consented: boolean) {
        let tank_id = this.client_to_tank.get(client.sessionId);
        this.state.player_count -= 1;
        if (tank_id != undefined){
            this.state.map.delete(tank_id);
            this.client_to_tank.delete(client.sessionId);
            this.client_to_buffer.delete(client.sessionId);
            console.log("User:", client.sessionId, "and its tank", tank_id, "has left the game room");
        }
        else{
            console.log("User ", client.sessionId, " has left the game room");
        }

        console.log("Player count is: ", this.state.player_count)
        

    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}
