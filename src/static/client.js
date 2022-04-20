import { ClientState } from "/static/ClientState.js"

const gamebox = document.getElementById("gamebox");
const minimap = document.getElementById("minimap");
const SCREEN_DIMS = {width: gamebox.clientWidth, height: gamebox.clientHeight};
const MAP_DIMS = {width: 250, height: 250};
// const MAP_VIEW_RATIO = {width: MAP_DIMS.width / 100, height: MAP_DIMS.height / 100};
const MAP_VIEW_RATIO = {width: 2, height: 2};
let client_state = new ClientState(SCREEN_DIMS, MAP_DIMS, MAP_VIEW_RATIO);

let MINIMAP_DIMS = {width: minimap.clientWidth, height: minimap.clientHeight};
let minimap_state = new ClientState(MINIMAP_DIMS, MAP_DIMS, {width: 1, height: 1});
let player_count = 0;

var host = window.document.location.host.replace(/:.*/, '');
var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
// var client = new Colyseus.Client("wss://xq-zci.colyseus.dev");


/******* Button press registering variables *******/

let keys = new Set(),
    tankMoveInterval = null,
    allowedKeys = {
        'KeyW': true, // W
        'KeyS': true, // S
        'KeyA': true, // A
        'KeyD': true, // D
    };

client.joinOrCreate("battle_room").then(room => {
    console.log("joined");
    // pixi initialization
    let app = new PIXI.Application({
        width: SCREEN_DIMS.width,
        height: SCREEN_DIMS.height,
        backgroundColor: 0xffffff
    });
    let miniapp = new PIXI.Application({
        width: MINIMAP_DIMS.width,
        height: MINIMAP_DIMS.height,
        backgroundColor: 0xffffff
    });

    gamebox.appendChild(app.view);
    minimap.appendChild(miniapp.view);

    const BACKGROUND_PATH = "images/background.jpeg";
    var background = new PIXI.TilingSprite.from(BACKGROUND_PATH, {width: SCREEN_DIMS.width * MAP_VIEW_RATIO.width,
        height: SCREEN_DIMS.height * MAP_VIEW_RATIO.height});
    background.position.set(0,0);
    app.stage.addChild(background);
    client_state.background = background;

    // game map decls
    // client_state.render_bars();
    
    // gameobj listeners
    room.state.map.listen("synced_tiles", (currentValue, previousValue) => {
        currentValue.onAdd = (gameobj, key) => {
            console.log("gameobj is", gameobj);
         
            console.log("adding gameobj ", gameobj.id);
            let index = client_state.get_index_from_key(key);
        
            console.log(gameobj, "has been added at", index);
            try {
                let sprite = client_state.add_gameobj(gameobj, index);
                app.stage.addChild(sprite);
                let mini_sprite = minimap_state.add_gameobj(gameobj, index);
                miniapp.stage.addChild(mini_sprite);
                console.log(gameobj, "has been added at", index);
            } catch(error) {
                room.send("error");
            }
        };
        
        currentValue.onRemove = (gameobj, key) => {
            console.log("removing gameobj", gameobj.id);
            client_state.render_view();
            let index = client_state.get_index_from_key(key);
            try {
                let sprite = client_state.remove_gameobj(gameobj, index);
                app.stage.removeChild(sprite);
                let mini_sprite = minimap_state.remove_gameobj(gameobj, index);
                miniapp.stage.removeChild(mini_sprite);
                console.log(gameobj, "has been removed at: ", index);
            } catch(error) {
                room.send("error");
            }
        }
    });

    room.onError((code, message) => {
        console.log("oops, error ocurred:");
        console.log(message);
    });

    room.onMessage("room", (type) => {
        overlayOff();
        overlayOn(`room_${type}`);
    });

    room.onMessage("player_count", function(value) {
        player_count = value;
        let plural = player_count == 1 ? '' : 's';
        let message = `${player_count} player${plural} in the room.`;
        document.getElementById("player-count-leader").innerText = message;
        document.getElementById("player-count-client").innerText = message;
    });

    document.getElementById('start-game').addEventListener('click', function() {
        if (player_count < 2) {
            document.getElementById('warning').innerText = "Minimum 2 players.";
        } else {
            room.send("start");
        }
    });

    room.onMessage("tank_id", function (message) {
        console.log("setting tank_id", message);
        client_state.set_tank_id(message.tank_id, message.start_location, message.tank_health);
        minimap_state.set_tank_id(message.tank_id, message.start_location);
    });

    room.onMessage("win", () => {
        unbindClient("Congratulations, you win!");
    });
    
    room.onMessage("lose", function (value) {
        unbindClient(`You died! You rank #${value}.`);
    });

    room.onMessage("hit", function (new_health) {
        client_state.change_health(new_health);
    });

    room.onMessage("new_weapon", function (new_weapon) {
        client_state.change_weapon(new_weapon);
    });

    room.onMessage("explosion", function (index) {
        const EXPLOSION_LENGTH = 1000
        console.log("exploding tank")
        let sprite = client_state.explode_tank(index);
        app.stage.addChild(sprite);
        setTimeout(() => app.stage.removeChild(sprite), EXPLOSION_LENGTH);

        let mini_sprite = minimap_state.explode_tank(index);
        miniapp.stage.addChild(mini_sprite);
        setTimeout(() => miniapp.stage.removeChild(mini_sprite), EXPLOSION_LENGTH);
    });
    
    room.onMessage("start", function() {
        overlayOff();

        document.onkeydown = function (e) {
            e.preventDefault();
            
            if (allowedKeys[e.code]) {
                if (!keys.has(e.code)) {
                    keys.add(e.code);
                
                    if (tankMoveInterval === null) {
                        room.send("button", e.code);
                        tankMoveInterval = setInterval(function () {
                            keys.forEach((key) => {
                                room.send("button", key);
                            });
                        }, 100);
                    }
                }
            }
        };

        document.onkeyup = function (e) {
            e.preventDefault();
            keys.delete(e.code);
            // need to check if keyboard movement stopped
            if ((allowedKeys[e.code]) && (keys.size === 0)) {
                clearInterval(tankMoveInterval);
                tankMoveInterval = null;
            }
        };

        /******* Projectile code *******/
        document.onclick = function(e) {
            var mouseX = e.pageX; 
            var mouseY = e.pageY; 
            var [tankX, tankY] = client_state.get_screen_coordinates(client_state.tank_pos);
            tankY += client_state.tank_dims.height * client_state.tile_size.height / 2;
            tankX += client_state.tank_dims.width  * client_state.tile_size.width  / 2;
            // code for updating barrelDirection
            var barrelDirection = Math.atan2(mouseY - tankY, mouseX - tankX); // angle in radians

            console.log("clicked on ", e.pageX, e.pageY);
            room.send("projectile", barrelDirection);
        };
    });

    // projectile code
    room.state.map.listen("projectiles", (currentValue, previousValue) => {
        currentValue.onAdd = (projectile, key) => {
            console.log("adding projectile", projectile);
            let sprite = client_state.add_projectile(projectile);
            app.stage.addChild(sprite);
        };

        currentValue.onRemove = (projectile, key) => {
            console.log("removing projectile", projectile.id);
            let sprite = client_state.remove_projectile(projectile);
            app.stage.removeChild(sprite);
        }
    });
});


function unbindClient(message) {
    document.onkeydown = null;
    document.onkeyup = null;
    document.onmousemove = null;
    document.onclick = null;
    document.getElementById('game-over').innerText = message;
    keys.clear();
    tankMoveInterval = null;
    overlayOff();
    overlayOn("game_over");
}

function overlayOn(type) {
    if (type == "room_leader") {
        document.getElementById("overlay-leader").style.display = "flex";
    } else if (type == "room_client") {
        document.getElementById("overlay-client").style.display = "flex";
    } else if (type == "game_over") {
        document.getElementById("overlay-end").style.display = "flex";
    }
}

function overlayOff() {
    document.getElementById("overlay-leader").style.display = "none";
    document.getElementById("overlay-client").style.display = "none";
    document.getElementById("overlay-end").style.display = "none";
}