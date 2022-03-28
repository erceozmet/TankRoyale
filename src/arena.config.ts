import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from "path";
/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";

export default Arena({
    getId: () => "Tank Royale",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('my_room', MyRoom);
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("Connected to backend server");
        });

        app.use("/client", (req, res) =>{
            res.sendFile(path.join(__dirname, '/static/game.html'))
        })
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});