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
            let col = projectile.col;
            let row = projectile.row;
            console.log("delta time", deltaTime);
            let distance = projectile.speed * (deltaTime / 1000);

            console.log(distance);
            let newX = col + (Math.cos(projectile.direction) * distance);
            let newY = row + (Math.sin(projectile.direction) * distance);

            let newLoc = new Location(newX, newY);

            projectile.col = newLoc.col;
            projectile.row = newLoc.row;

            console.log("old loc: ", col, row);
            console.log("new loc: ", newLoc.col, newLoc.row);

            // booleans for checking if projectile should explode
            let is_inside_walls = this.state.map.checkRange(newLoc.col, newLoc.row);
            projectile.rangeRemaining -= distance;
            let has_range_remaining = projectile.rangeRemaining > 0;
            let obj_at_newloc = this.state.map.at(Math.round(newLoc.col), Math.round(newLoc.row));
            let my_tank = this.state.map.get(projectile.tank_id) as Tank;
            let is_on_enemy = obj_at_newloc != null && obj_at_newloc.getType() == "tank" && obj_at_newloc != my_tank; // it's a tank but not ours

            console.log(!is_inside_walls, !has_range_remaining, is_on_enemy);
            // if the projectile is out of range or collided, then explode
            if (!is_inside_walls || !has_range_remaining || is_on_enemy) {
                console.log("explode")
                this.state.map.explodeProjectile(projectile);
                if (is_on_enemy) {
                    let enemy_tank = obj_at_newloc as Tank;
                    enemy_tank.health -= projectile.damage;
                    console.log("tank health: ", enemy_tank.health);
                    if (enemy_tank.health <= 0) {
                        console.log("EXPLODE");
                        this.state.map.explodeTank(enemy_tank);
                        this.client_to_tank.delete(enemy_tank.client);
                        this.client_to_buffer.delete(enemy_tank.client);
                        this.broadcast("kill", {killer: my_tank.client, killed: enemy_tank.client});
                    }
                }
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
        });

        this.onMessage("projectile", (client, barrelDirrection) => {
            let tank = this.state.map.get(this.client_to_tank.get(client.sessionId)) as Tank;
            let tankLoc = this.state.map.locations.get(tank.id);
            let weapon = tank.weapon;
            // POSSIBLY keep track of who shot who

            console.log(weapon.fireCountdown);
            if (weapon.fireCountdown == 0) {
                console.log("pushed");
                let projectileLoc = new Location(Math.round(tankLoc.col + tank.width / 2), Math.round(tankLoc.row + tank.height / 2));
                
                let projectile = weapon.shootProjectile(tank.id, barrelDirrection, this.state.map.getUniqueId(), projectileLoc);
                this.state.map.projectiles.push(projectile);
                weapon.fireCountdown = weapon.fire_rate;
            }
        });
    }

    onJoin (client: Client, options: any) {
        this.state.player_count += 1;
        let start_index = Math.floor(Math.random() * (this.player_locations.length -1));
        let start_location = this.player_locations[start_index];
        this.player_locations.splice(start_index, 1);
        let tank = new Tank(client.sessionId);

        
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
