import { ClientState } from "/static/ClientState.js"

const SCREEN_DIMS = {width: 1000, height: 540};
const MAP_DIMS = {width: 1000, height: 1000};
const MAP_VIEW_RATIO = {width: 10, height: 10};
let client_state = new ClientState(SCREEN_DIMS, MAP_DIMS, MAP_VIEW_RATIO);



// pixi initialization
const gamebox = document.getElementById("gamebox");
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
    room.send("get_tank_id");
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
            console.log("key is ", key)
        };
        currentValue.onChange = (gameobj, key) => {
            // let index = client_state.get_index_from_key(key);
            // let sprite = client_state.add_gameobj(gameobj, key);
            // app.stage.addChild(sprite);
            // console.log(gameobj, "has been changed at", index);
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
    room.onMessage("buttons", function (message) {
        var p = document.createElement("p");
        p.innerText = message;
        document.querySelector("#buttons").appendChild(p);
    });

    room.onMessage("tank_id", function (message) {
        console.log("tank_id", message);

        
        client_state.set_tank_id(message.tank_id, message.start_location);
    });

    room.onError((code, message) => {
        console.log("oops, error ocurred:");
        console.log(message);
    });


    /******* Button press registering code *******/
    let keys = new Set(),
        interval = null,
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
            
            if (interval === null) {
                interval = setInterval(function () {
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
            clearInterval(interval);
            interval = null;
        }
    };
});
