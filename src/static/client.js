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
    room.onStateChange.once(function (state) {
        // console.log("initial room state:", state);
        // document.write(`<div id = "za"><ul>${state.client_adresses.forEach((item) => `<li>${item}</li>`).join('')}</ul></div>`);
    });

    // game map decls
    client_state.render_bars();

    room.state.map.listen("synced_tiles", (currentValue, previousValue) => {
        currentValue.onAdd = (gameobj, key) => {
            console.log("adding ", gameobj.id);
            let index = client_state.get_index_from_key(key);

            let sprite = client_state.add_gameobj(gameobj, index);
            app.stage.addChild(sprite);


            console.log(gameobj, "has been added at", index);
        };
        currentValue.onChange = (gameobj, key) => {
        };

        currentValue.onRemove = (gameobj, key) => {
            console.log("removing ", gameobj.id);
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
        // console.log("tank_id", message);
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
    var projectileMoveInterval = null;
    document.onmousemove = function(e) {
        var mouseX = e.pageX; 
        var mouseY = e.pageY; 
        // console.log("x", mouseX);
        // console.log("y", mouseY);
        var [tankX, tankY] = client_state.get_screen_coordinates(client_state.tank_pos);
        // console.log("tankx", tankX);
        // console.log("tanky", tankY);
        tankY += client_state.tank_dims.height * client_state.tile_size.height / 2;
        tankX += client_state.tank_dims.width  * client_state.tile_size.width  / 2;
        // console.log("tankx", tankX);
        // console.log("tanky", tankY);

        // code for updating barrelDirection
        barrelDirection = Math.atan2(mouseY - tankY, mouseX - tankX); // angle in radians

        // console.log(barrelDirection * 57.2958);
        // insert code for rendering new barrel
    };

    document.onclick = function(e) {
        console.log("clicked");
        room.send("projectile", barrelDirection);
    };

    room.state.map.listen("projectiles", (currentValue, previousValue) => {
        currentValue.onAdd = (projectile, key) => {
            console.log("projec", projectile);

            let sprite = PIXI.Sprite.from(projectile.imagePath);
            sprite.height = client_state.tile_size.height * projectile.height;
            sprite.width  = client_state.tile_size.width  * projectile.width;
            
            [sprite.x, sprite.y] = client_state.get_screen_coordinates({row: projectile.row, col: projectile.col});
            client_state.projectiles.push(sprite);
            app.stage.addChild(sprite);
            // // client.projectiles.push(gameobj);
            if (projectileMoveInterval === null) {
                projectileMoveInterval = setInterval( () => {
                    // sprite.x += 5;
                    // render all projectiles in the list
                    let distance = 3;
                    sprite.x += (Math.cos(projectile.direction) * distance);
                    sprite.y += (Math.sin(projectile.direction) * distance);
                    // let newX =  Math.round(col + (Math.cos(projectile.direction) * distance));
                    // let newY =  Math.round(row + (Math.sin(projectile.direction) * distance));

                    // let newLoc = new Location(newX, newY);
                }, 50);
            }
        };
        currentValue.onChange = (gameobj, key) => {
            console.log("change projectile")
            // remove gameobj from list of projectiles to be rendered
            // play explosion animation in the coordinates of projectile

            // if (projectiles.size == 0) { // replace with list of projectiles
            //     clearInterval(projectileMoveInterval);
            //     projectileMoveInterval = null;
            // }
        }
        currentValue.onRemove = (gameobj, key) => {
            console.log("remove projectile")
            // remove gameobj from list of projectiles to be rendered
            // play explosion animation in the coordinates of projectile

            // if (projectiles.size == 0) { // replace with list of projectiles
            //     clearInterval(projectileMoveInterval);
            //     projectileMoveInterval = null;
            // }
        }
    });
});
