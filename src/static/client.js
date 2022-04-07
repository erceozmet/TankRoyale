import { ClientState } from "/static/ClientState.js"

let client_state = new ClientState();


// pixi initialization
const gamebox = document.getElementById("gamebox");
let app = new PIXI.Application({width : client_state.screen_dims.width, 
                                height: client_state.screen_dims.height, 
                                backgroundColor: 0xffffff });
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
            let index = client_state.get_index_from_key(key);
            if (index.row > 100 || index.col > 100) {
                return;
            }
            let sprite = client_state.add_gameobj(gameobj, key);
            app.stage.addChild(sprite);
            
            
            
            // let x = key % room.state.map.width;
            // let y = Math.floor(key / room.state.map.width);
            // console.log("x:" ,room.state.map.width);
            // console.log("x:" + x + "-- y: " + y);
            
            // tiles[key] = gameobj;
            // render_sprite(tile_dims, gameobj, key);
            console.log(gameobj, "has been added at", index);
            console.log("key is " , key)
        };
        currentValue.onChange = (gameobj, key) => {
            let index = client_state.get_index_from_key(key);
            console.log(gameobj, "has been changed at", index);
        };

        currentValue.onRemove = (gameobj, key) => {
            let index = client_state.get_index_from_key(key);
            let sprite = client_state.remove_gameobj(gameobj);
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

    room.onError((code, message) => {
        console.log("oops, error ocurred:");
        console.log(message);
    })
    // TODO multiple keys
    // send message to room on submit
    document.onkeydown = function (e) {
        e.preventDefault();

        console.log("button:", e.code);

        // send data to room
        room.send("button", e.code);
    }
    // send message to room on submit
    document.onkeyup = function (e) {
        e.preventDefault();

        console.log("keyup:", e.code);

        // send data to room
        room.send("keyup", e.code);
    }
});
