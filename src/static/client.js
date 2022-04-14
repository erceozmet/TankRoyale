import { ClientState } from "/static/ClientState.js"

console.log("dh" ,document.height);
const gamebox = document.getElementById("gamebox");
const SCREEN_DIMS = {width: gamebox.clientWidth, height: gamebox.clientHeight};
const MAP_DIMS = {width: 1000, height: 1000};
const MAP_VIEW_RATIO = {width: 10, height: 10};
let client_state = new ClientState(SCREEN_DIMS, MAP_DIMS, MAP_VIEW_RATIO);

// pixi initialization
let app = new PIXI.Application({
    width: SCREEN_DIMS.width,
    height: SCREEN_DIMS.height,
    backgroundColor: 0xffffff
});
gamebox.appendChild(app.view);


var host = window.document.location.host.replace(/:.*/, '');
var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
client.joinOrCreate("battle_room").then(room => {
    console.log("joined");

    // game map decls
    client_state.render_bars();

    // gameobj listeners
    room.state.map.listen("synced_tiles", (currentValue, previousValue) => {
        currentValue.onAdd = (gameobj, key) => {
            console.log("adding gameobj ", gameobj.id);
            let index = client_state.get_index_from_key(key);

            let sprite = client_state.add_gameobj(gameobj, index);
            app.stage.addChild(sprite);


            console.log(gameobj, "has been added at", index);
        };
        currentValue.onChange = (gameobj, key) => {
        };

        currentValue.onRemove = (gameobj, key) => {
            console.log("removing gameobj", gameobj.id);
            client_state.render_view();
            let index = client_state.get_index_from_key(key);
            let sprite = client_state.remove_gameobj(gameobj, index);
            app.stage.removeChild(sprite);
            console.log(gameobj, "has been removed at: ", index)
        }
    });

    room.onStateChange(function (state) {
        // document.write(`<div id = "za"><ul>${state.client_adresses.forEach((item) => `<li>${item}</li>`).join('')}</ul></div>`);
        // this signal is triggered on each patch
    });


    // listen to patches coming from the server
    room.onMessage("kill", function (message) {
        var p = document.createElement("p");
        p.innerText = "Tank " + message.killer + " has eliminated tank " + message.killed;
        document.querySelector("#buttons").appendChild(p);
    });

    room.onMessage("tank_id", function (message) {
        console.log("setting tank_id", message);
        client_state.set_tank_id(message.tank_id, message.start_location);
    });

    room.onError((code, message) => {
        console.log("oops, error ocurred:");
        console.log(message);
    });

    /******* Button press registering code *******/
    let keys = new Set(),
        tankMoveInterval = null,
        allowedKeys = {
            'KeyW': true, // W
            'KeyS': true, // S
            'KeyA': true, // A
            'KeyD': true, // D
        };

    document.onkeydown = function (e) {
        e.preventDefault();
        
        if (allowedKeys[e.code]) {
            if (!keys.has(e.code)) {
                keys.add(e.code);
            }
            
            if (tankMoveInterval === null) {
                tankMoveInterval = setInterval(function () {
                    keys.forEach((key) => {
                        room.send("button", key);
                    });
                }, 100);
            }
        }
    };

    document.onkeyup = function (e) {
        e.preventDefault();
        if (keys.has(e.code)) {
            keys.delete(e.code);
        }
        // need to check if keyboard movement stopped
        if ((allowedKeys[e.code]) && (keys.size === 0)) {
            clearInterval(tankMoveInterval);
            tankMoveInterval = null;
        }
    };

    /******* Projectile code *******/
    var barrelDirection; // hardcoded 30 for testing
    document.onmousemove = function(e) {
        var mouseX = e.pageX; 
        var mouseY = e.pageY; 
        var [tankX, tankY] = client_state.get_screen_coordinates(client_state.tank_pos);
        tankY += client_state.tank_dims.height * client_state.tile_size.height / 2;
        tankX += client_state.tank_dims.width  * client_state.tile_size.width  / 2;
        // code for updating barrelDirection
        barrelDirection = Math.atan2(mouseY - tankY, mouseX - tankX); // angle in radians

    };

    document.onclick = function(e) {
        console.log("clicked on ", e.pageX, e.pageY);
        room.send("projectile", barrelDirection);
    };

    // projectile code
    room.state.map.listen("projectiles", (currentValue, previousValue) => {
        currentValue.onAdd = (projectile, key) => {
            console.log("adding projectile", projectile);
            let sprite =client_state.add_projectile(projectile);
            app.stage.addChild(sprite);
            
        };
        currentValue.onChange = (gameobj, key) => {
            console.log("change projectile")
        }
        currentValue.onRemove = (projectile, key) => {
            console.log("removing projectile", projectile.id);
            let sprite = client_state.remove_projectile(projectile);
            app.stage.removeChild(sprite);
        }
    });
});
