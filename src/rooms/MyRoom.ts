import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { Location } from "./schema/GameMap";
import { Tank } from "./schema/Tank";
import { Sniper, SubmachineGun, Shotgun } from "./schema/Weapon";
import { Obstacle } from "./schema/Obstacle";

export class MyRoom extends Room<MyRoomState> {

    client_to_tank = new Map();
    client_to_buffer = new Map();
    player_locations = new Array();
    player_count = 0;
    room_leader: Client = null;
    game_started = false;

    initialize_player_loc() {
        let players_per_row = Math.sqrt(this.player_count);
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

    place_tanks() {
        for (let i = 0; i < this.clients.length; i++) {
            let client = this.clients[i];
            // pick random start loc for client
            let start_index = Math.floor(Math.random() * (this.player_locations.length -1));
            let start_location = this.player_locations[start_index];
            this.player_locations.splice(start_index, 1);
    
            // put client's tank on the map
            let tank = new Tank(client);
            let tank_health = tank.health;
            let tank_id = this.state.map.put(tank, start_location[0], start_location[1]);
            client.send("tank_id", {tank_id, start_location, tank_health});
            client.send("new_weapon", { name: tank.weapon.name, imagePath: tank.weapon.imagePath } );

            this.client_to_tank.set(client.sessionId, tank_id);
            this.client_to_buffer.set(client.sessionId, new Array());
        }
    }

    place_obstacles() {
        let count = 10;
        for (let i = 0; i < count; i++) {
            let x: number, y: number;
            let map_height = this.state.map.height;
            let map_width = this.state.map.width;
            let obstacle_length = Math.round(Math.random() * 30 + 10);
            let obstacle;
            if (Math.random() > 0.5){
                obstacle = new Obstacle(3, obstacle_length);
            }
            else{
                obstacle = new Obstacle(obstacle_length, 3);
            }
           
            do {
                x = Math.floor(Math.random() * map_height);
                y = Math.floor(Math.random() * map_width);
            } while (!this.state.map.canPlace(x, y, obstacle));
            this.state.map.put(obstacle, x, y);
        }
        
    }

    place_weapons() {
        // drop 3 of each special weapon on random coordinates
        let count = 10;
        for (let i = 0; i < count; i++) {
            let weapons = [new Sniper(), new SubmachineGun(), new Shotgun()];
            for (let j = 0; j < weapons.length; j++) {
                let x: number, y: number;
                let map_height = this.state.map.height;
                let map_width = this.state.map.width;
                do {
                    x = Math.floor(Math.random() * map_height);
                    y = Math.floor(Math.random() * map_width);
                } while (!this.state.map.canPlace(x, y, weapons[j]));
                this.state.map.put(weapons[j], x, y);
            }
        }
    }

    dispose_client(client_id: string) {
        console.log("dispose client")
        let tank_id = this.client_to_tank.get(client_id);
        console.log("tank", tank_id);
        this.state.map.delete(tank_id);

        this.client_to_tank.delete(client_id);
        this.client_to_buffer.delete(client_id);
    }

    update (deltaTime: any) {
        this.client_to_buffer.forEach((buffer, client) => {
            let tankId = this.client_to_tank.get(client);
            let tank = this.state.map.get(tankId) as Tank;

            if (this.client_to_tank.size == 1) {
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
            if (right != 0 || up != 0) {
                console.log("right", right, "up", up);
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
            let is_on_obstacle = obj_at_newloc != null && obj_at_newloc.getType() == "obstacle";
            // if the projectile is out of range or collided, then explode
            if (!is_inside_walls || !has_range_remaining || is_on_enemy || is_on_obstacle) {
                console.log("explode")
                this.state.map.explodeProjectile(projectile);
                if (is_on_enemy || is_on_obstacle) {
                    my_tank.client.send("explosion", {id: projectile.id, col: Math.round(projectile.col), row: Math.round(projectile.row)})
                }
                if (is_on_enemy) {
                    let enemy_tank = obj_at_newloc as Tank;
                    enemy_tank.health -= projectile.damage;
                    enemy_tank.client.send("hit", enemy_tank.health);
                    console.log("tank health: ", enemy_tank.health);
                    if (enemy_tank.health <= 0) {
                        console.log("EXPLODE");
                        enemy_tank.client.send("lose", this.client_to_tank.size);                        
                        this.dispose_client(enemy_tank.client.sessionId);
                    }
                }
            }
        });
    }
    
    gameStart() {
        this.clock.clear(); // cancel the timeout for disposing room (in case room leader is AFK)

        this.initialize_player_loc();

        this.place_tanks();
        this.place_weapons();
        this.place_obstacles();

        this.setSimulationInterval((deltaTime) => this.update(deltaTime));

        this.game_started = true;

        this.onMessage("error", (client) => {
            let tank_id = this.client_to_tank.get(client.sessionId);
            let loc = this.state.map.locations.get(tank_id);
            let tank = this.state.map.get(tank_id) as Tank;
            let new_tank = new Tank(tank.client);
            new_tank.health = tank.health;
            new_tank.weapon = tank.weapon;
            new_tank.id = tank.id;

            for (let i = 0; i < new_tank.width; i++) {
                for (let j = 0; j < new_tank.height; j++) {
                    this.state.map.tiles.set(loc.col + i, loc.row + j, new_tank);
                }
            }
            this.state.map.synced_tiles.set(this.state.map.to1D(loc.col, loc.row), tank);
        });

        this.onMessage("button", (client, button) => {
            let buffer = this.client_to_buffer.get(client.sessionId)
            if (buffer){
                buffer.push(button);
            }
        });

        this.onMessage("projectile", (client, barrelDirrection) => {
            let tank_id = this.client_to_tank.get(client.sessionId);
            if (!tank_id) return;
            let tank = this.state.map.get(tank_id) as Tank;
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

        this.onMessage("start", () => {
            this.lock();
            this.gameStart();
            this.broadcast("start");
        });

        this.clock.setTimeout(() => {
            this.broadcast("timeout");   
            this.disconnect();
        }, 900000); // 15 minutes
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "has joined the room.");
        this.player_count += 1;

        if (this.player_count == 1) {
            client.send("room", "leader");
            this.room_leader = client;
        } else {
            client.send("room", "client");
        }

        this.broadcast("player_count", this.player_count);
    }

    onLeave(client: Client, consented: boolean) {
        let tank_id = this.client_to_tank.get(client.sessionId);
       
        if (tank_id != undefined){
            this.dispose_client(client.sessionId);
            console.log("User:", client.sessionId, "and its tank", tank_id, "has left the game room");
        }
        else{
            console.log("User ", client.sessionId, " has left the game room");
        }

        this.player_count -= 1;
        console.log("Player count is: ", this.player_count);
        this.broadcast("player_count", this.player_count);

        // if room leader leaves without starting the game, assign someone else to be the room leader
        if (this.room_leader == client && !this.game_started) {
            for (let i = 0; i < this.clients.length; i++) {
                if (this.clients[i] != this.room_leader) {
                    this.room_leader = this.clients[i];
                    this.clients[i].send("room", "leader");
                    break;
                }
            }
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}