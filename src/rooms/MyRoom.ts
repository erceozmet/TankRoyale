import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { GameMap, Location } from "./schema/GameMap";
import { Tank } from "./schema/Tank";
import { SniperWeapon, MachinegunWeapon, ShotgunWeapon } from "./schema/Weapon";
import { Obstacle } from "./schema/Obstacle";

export class MyRoom extends Room<MyRoomState> {
   
    client_to_tank = new Map();
    client_to_buffer = new Map();
    player_locations = new Array();

    initialize_player_loc() {
        let max_player_count = 25;
        let players_per_row = Math.sqrt(max_player_count);
        let map_width = this.state.map.width;
        let map_height = this.state.map.height;
        let offset = 20;
        let x_gap = Math.round((map_width - offset * 2) / players_per_row);
        let y_gap = Math.round((map_height - offset * 2) / players_per_row);

        for (let i = 0; i < players_per_row; i++) {
            let x = offset + (x_gap * i);
            for (let j = 0; j < players_per_row; j++){
                let y = offset + (y_gap * j);
                this.player_locations.push([x, y])
            }
        }
    }

    doesOverlap(l1: Location, r1: Location, l2: Location, r2: Location): boolean {
        // If one rectangle is on left side of other
        if (l1.col > r2.col || l2.col > r1.col)
            return false;
    
        // If one rectangle is above other
        if (r1.row > l2.row || r2.row > l1.row)
            return false;
    
        return true;
    }

    place_obstacles(map: GameMap) {
        
        let count = 10;
        for (let i = 0; i < count; i++) {
            let x: number, y: number;
            let map_height = this.state.map.height;
            let map_width = this.state.map.width;
            let obstacle = new Obstacle(1, 15);
            do {
                x = Math.floor(Math.random() * map_height);
                y = Math.floor(Math.random() * map_width);
            } while (!map.canPlace(x, y, obstacle));
            map.put(obstacle, x, y);
        }
        
    }

    place_weapons(map: GameMap) {
        // drop 3 of each special weapon on random coordinates
        let count = 10;
        for (let i = 0; i < count; i++) {
            let weapons = [new SniperWeapon(), new MachinegunWeapon(), new ShotgunWeapon()];
            for (let j = 0; j < weapons.length; j++) {
                let x: number, y: number;
                let map_height = this.state.map.height;
                let map_width = this.state.map.width;
                do {
                    x = Math.floor(Math.random() * map_height);
                    y = Math.floor(Math.random() * map_width);
                } while (!map.canPlace(x, y, weapons[j]));
                map.put(weapons[j], x, y);
            }
        }
    }

    update (deltaTime: any) {
        this.client_to_buffer.forEach((buffer, client) => {
            let tankId = this.client_to_tank.get(client);
            let tank = this.state.map.get(tankId) as Tank;

            if (this.state.player_count == 1) {
                tank.client.send("win");
            }

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
            }
            if (Math.abs(up) + Math.abs(right) > 2){
                if (up > 1){
                    up = 1;
                }
                if (up < -1){
                    up = -1;
                }
                if (right > 1){
                    right = 1;
                }
                if (right < -1){
                    right = -1;
                }
            }
            if (right != 0 || up != 0) {    
                this.state.map.moveTank(tankId, right, up);
            }
            this.client_to_buffer.set(client, []);
        });

        this.state.map.projectiles.forEach((projectile) => {
            let col = projectile.col;
            let row = projectile.row;
            let distance = projectile.speed * (deltaTime / 1000);
            let newX = col + (Math.cos(projectile.direction) * distance);
            let newY = row + (Math.sin(projectile.direction) * distance);
            let newLoc = new Location(newX, newY);
            projectile.col = newLoc.col;
            projectile.row = newLoc.row;

            // booleans for checking if projectile should explode
            let is_inside_walls = this.state.map.checkRange(newLoc.col, newLoc.row);
            projectile.rangeRemaining -= distance;
            let has_range_remaining = projectile.rangeRemaining > 0;
            let obj_at_newloc = this.state.map.at(Math.round(newLoc.col), Math.round(newLoc.row));
            let my_tank = this.state.map.get(projectile.tank_id) as Tank;
            let is_on_enemy = obj_at_newloc != null && obj_at_newloc.getType() == "tank" && obj_at_newloc != my_tank; // it's a tank but not ours

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
                        this.client_to_buffer.delete(enemy_tank.client.sessionId);
                        this.client_to_tank.delete(enemy_tank.client.sessionId);
                        this.state.map.explodeTank(enemy_tank);
                        enemy_tank.client.send("killed", this.state.player_count--);
                    }
                }
            }
        });
    }
    
    gameStart() {
        this.place_weapons(this.state.map);
        this.place_obstacles(this.state.map)

        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
       
        this.onMessage("button", (client, button) => {
            this.client_to_buffer.get(client.sessionId).push(button);
        });

        this.onMessage("projectile", (client, barrelDirrection) => {
            let tank = this.state.map.get(this.client_to_tank.get(client.sessionId)) as Tank;
            let tankLoc = this.state.map.locations.get(tank.id);
            let weapon = tank.weapon;
            // TODO POSSIBLY keep track of who shot who

            if (weapon.fireCountdown == 0) {
                let projectileLoc = new Location(Math.round(tankLoc.col + tank.width / 2), Math.round(tankLoc.row + tank.height / 2));
                console.log("new projectile, loc: ", projectileLoc, "barrel direction: ", barrelDirrection);
                
                let projectile = weapon.shootProjectile(tank.id, barrelDirrection, this.state.map.getUniqueId(), projectileLoc);
                this.state.map.projectiles.push(projectile);
                weapon.fireCountdown = weapon.fire_rate;
            }
        });
    }
    
    onCreate(options: any) {
        this.setState(new MyRoomState());
        this.initialize_player_loc();
    }

    onJoin(client: Client, options: any) {
        this.state.player_count += 1

        // pick random start loc for client
        let start_index = Math.floor(Math.random() * (this.player_locations.length -1));
        let start_location = this.player_locations[start_index];
        this.player_locations.splice(start_index, 1);

        // put client's tank on the map
        let tank = new Tank(client);
        let tank_id = this.state.map.put(tank, start_location[0], start_location[1]);
        client.send("tank_id", {tank_id, start_location});

        this.client_to_tank.set(client.sessionId, tank_id);
        this.client_to_buffer.set(client.sessionId, new Array());

        console.log(client.sessionId, "has joined the room.");
        if (this.state.player_count == this.state.player_size) {
            this.gameStart();
            this.lock();
            this.broadcast("start");
        } else {
            this.broadcast("waiting", this.state.player_size - this.state.player_count);
        }
    }

    onLeave(client: Client, consented: boolean) {
        let tank_id = this.client_to_tank.get(client.sessionId);
       
        if (tank_id != undefined){
            this.state.map.delete(tank_id);
            this.client_to_tank.delete(client.sessionId);
            this.client_to_buffer.delete(client.sessionId);
            this.state.player_count -= 1;
            console.log("User:", client.sessionId, "and its tank", tank_id, "has left the game room");
        }
        else{
            console.log("User ", client.sessionId, " has left the game room");
        }

        console.log("Player count is: ", this.state.player_count);
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}