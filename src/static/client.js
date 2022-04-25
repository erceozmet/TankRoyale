import { ClientState } from "/static/ClientState.js"

const gamebox = document.getElementById("gamebox");
const minimap = document.getElementById("minimap");
const SCREEN_DIMS = {width: gamebox.clientWidth, height: gamebox.clientHeight};
const MAP_DIMS = {width: 250, height: 250};
// const MAP_VIEW_RATIO = {width: MAP_DIMS.width / 100, height: MAP_DIMS.height / 100};
const MAP_VIEW_RATIO = {width: 1.5, height: 1.5};
let client_state = new ClientState(SCREEN_DIMS, MAP_DIMS, MAP_VIEW_RATIO, true);

let MINIMAP_DIMS = {width: minimap.clientWidth, height: minimap.clientHeight};
let minimap_state = new ClientState(MINIMAP_DIMS, MAP_DIMS, {width: 1, height: 1}, false);
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
    // pixi initialization
    let app = new PIXI.Application({
        width: SCREEN_DIMS.width,
        height: SCREEN_DIMS.height,
        backgroundColor: 0xffffff
    });
    app.stage.addChild(client_state.barrel);
    let miniapp = new PIXI.Application({
        width: MINIMAP_DIMS.width,
        height: MINIMAP_DIMS.height,
        backgroundColor: 0xffffff,
    });

    gamebox.appendChild(app.view);
    minimap.appendChild(miniapp.view);

    const BACKGROUND_PATH = "images/background.jpeg";
    var background = new PIXI.TilingSprite.from(BACKGROUND_PATH, {width: SCREEN_DIMS.width * MAP_VIEW_RATIO.width,
        height: SCREEN_DIMS.height * MAP_VIEW_RATIO.height});
    background.position.set(0,0);
    app.stage.addChild(background);
    client_state.background = background;

    var mini_background = new PIXI.TilingSprite.from(BACKGROUND_PATH, {width: MINIMAP_DIMS.width, height: MINIMAP_DIMS.height});
    mini_background.position.set(0,0);
    miniapp.stage.addChild(mini_background);
    minimap_state.background = mini_background;
    
    // game map decls
    // client_state.render_bars();

    // gameobj listeners
    room.state.map.listen("synced_tiles", (currentValue, previousValue) => {
        currentValue.onAdd = (gameobj, key) => {         
            let index = client_state.get_index_from_key(key);
        
            if (gameobj.id) {
                let sprite = client_state.add_gameobj(gameobj, index);
                console.log("add gameobj", gameobj.id, "to", index)
                app.stage.addChild(sprite);
                if (gameobj.id == client_state.tank_id) {
                    app.stage.addChild(client_state.barrel);
                }
                let mini_sprite = minimap_state.add_gameobj(gameobj, index);
                if (mini_sprite) miniapp.stage.addChild(mini_sprite);
            } else {
                room.send("error");
            }
        };
        
        currentValue.onRemove = (gameobj, key) => {
            client_state.render_view();
            let index = client_state.get_index_from_key(key);
            if (gameobj.id) {
                let sprite = client_state.remove_gameobj(gameobj, index);
                app.stage.removeChild(sprite);
                let mini_sprite = minimap_state.remove_gameobj(gameobj, index);
                if (mini_sprite) miniapp.stage.removeChild(mini_sprite);
            } else {
                room.send("error");
            }
        }
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
        client_state.set_tank_id(message.tank_id, message.start_location, message.tank_health);
        minimap_state.set_tank_id(message.tank_id, message.start_location);
    });

    room.onMessage("win", () => {
        unbindClient("Congratulations, you win!");
    });
    
    room.onMessage("lose", function (value) {
        unbindClient(`You died! You rank #${value}.`);
    });

    room.onMessage("timeout", () => {
        unbindClient("Room timed out due to being idle for 15 minutes. Please refresh page!");
    });

    room.onMessage("hit", function (new_health) {
        client_state.change_health(new_health);
    });

    room.onMessage("new_weapon", function (weapon) {
        client_state.change_weapon(weapon);
    });

    room.onMessage("explosion", function (index) {
        const EXPLOSION_LENGTH = 200;
        let sprite = client_state.add_explosion(index);
        app.stage.addChild(sprite);
        setTimeout(() => {
            client_state.remove_explosion(index);
            app.stage.removeChild(sprite);
        }, EXPLOSION_LENGTH);
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
        document.onmousedown = function(e) {
            e.preventDefault();
        };

        app.stage.addChild(client_state.barrel);
        var barrelDirection = 0;
        document.onmousemove = function(e) {
            barrelDirection = client_state.render_barrel();
        };

        document.onclick = function(e) {
            room.send("projectile", barrelDirection);
        };
    });

    // projectile code
    room.state.map.listen("projectiles", (currentValue, previousValue) => {
        currentValue.onAdd = (projectile, key) => {
            let sprite = client_state.add_projectile(projectile);
            app.stage.addChild(sprite);
        };

        currentValue.onRemove = (projectile, key) => {
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