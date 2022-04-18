import { ClientState } from "/static/ClientState.js"

const gamebox = document.getElementById("gamebox");
const SCREEN_DIMS = {width: gamebox.clientWidth, height: gamebox.clientHeight};
const MAP_DIMS = {width: 250, height: 250};
// const MAP_VIEW_RATIO = {width: MAP_DIMS.width / 100, height: MAP_DIMS.height / 100};
const MAP_VIEW_RATIO = {width: 1, height: 1};
let client_state = new ClientState(SCREEN_DIMS, MAP_DIMS, MAP_VIEW_RATIO);


var host = window.document.location.host.replace(/:.*/, '');
var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
// var client = new Colyseus.Client("wss://xq-zci.colyseus.dev");

client.joinOrCreate("battle_room").then(room => {
    overlayOn();

    console.log("joined");
    // pixi initialization
    let app = new PIXI.Application({
        width: SCREEN_DIMS.width,
        height: SCREEN_DIMS.height,
        backgroundColor: 0xffffff
    });
    gamebox.appendChild(app.view);

    // game map decls
    client_state.render_bars();
    
    // gameobj listeners
    room.state.map.listen("synced_tiles", (currentValue, previousValue) => {
        currentValue.onAdd = (gameobj, key) => {
            console.log("gameobj is", gameobj);
         
            console.log("adding gameobj ", gameobj.id);
            let index = client_state.get_index_from_key(key);
        
            let sprite = client_state.add_gameobj(gameobj, index);
            app.stage.addChild(sprite);

            console.log(gameobj, "has been added at", index);
        };
        
        currentValue.onRemove = (gameobj, key) => {
            console.log("removing gameobj", gameobj.id);
            client_state.render_view();
            let index = client_state.get_index_from_key(key);
            let sprite = client_state.remove_gameobj(gameobj, index);
            app.stage.removeChild(sprite);
            console.log(gameobj, "has been removed at: ", index);
        }
    });

    room.onError((code, message) => {
        console.log("oops, error ocurred:");
        console.log(message);
    });

    room.onMessage("waiting", function(message) {
        let plural = message == 1 ? '' : 's';
        document.getElementById('overlay-message').innerText = `Waiting for ${message} other player${plural}...`;
    });

    room.onMessage("tank_id", function (message) {
        console.log("setting tank_id", message);
        client_state.set_tank_id(message.tank_id, message.start_location);
    });

    // listen to patches coming from the server
    room.onMessage("killed", function (message) {
        document.onkeydown = null;
        document.onkeyup = null;
        document.onmousemove = null;
        document.onclick = null;
        document.getElementById('overlay-message').innerText = `You died! You rank #${message}.`;
        overlayOn();
    });

    room.onMessage("win", () => {
        document.onkeydown = null;
        document.onkeyup = null;
        document.onmousemove = null;
        document.onclick = null;
        document.getElementById('overlay-message').innerText = "Congratulations, you win!";
        overlayOn();
    });
    
    room.onMessage("start", function() {
        overlayOff();

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
                    room.send("button", e.code);
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

function overlayOn() {
    document.getElementById("overlay").style.display = "flex";
}
  
function overlayOff() {
    document.getElementById("overlay").style.display = "none";
}