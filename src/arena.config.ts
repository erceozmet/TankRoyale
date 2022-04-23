import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import cors from "cors";
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
        gameServer.define('battle_room', MyRoom)
        .on("create", (room) => console.log("room created:", room.roomId))
        .on("dispose", (room) => console.log("room disposed:", room.roomId))
        .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
        .on("leave", (room, client) => console.log(client.id, "left", room.roomId));;
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("Connected to backend server");
        });

        const allowedOrigins = ['wss://xq-zci.colyseus.dev', 'https://xq-zci.colyseus.dev'];

        const options: cors.CorsOptions = {
        origin: allowedOrigins
        };
        app.use(cors(options));

        app.use("/client", (req, res) =>{
            res.sendFile(path.join(__dirname, '/static/game.html'))
        })
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());

        app.use("/images/tank.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/tank.png'))
        })

        app.use("/images/icon.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/icon.png'))
        })

        app.use("/images/barrel.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/barrel.png'))
        })
        app.use("/images/background.jpeg", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/background.jpeg'))
        })
        app.use("/images/explosion.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/explosion.png'))
        })
        app.use("/images/heart.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/heart.png'))
        })
        app.use("/images/projectile.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/projectile.png'))
        })
        app.use("/images/obstacle.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/obstacle.png'))
        })

        app.use("/images/shotgun.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/shotgun.png'))
        })

        app.use("/images/sniper.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/sniper.png'))
        })

        app.use("/images/smg.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/smg.png'))
        })

        app.use("/images/pistol.png", (req, res) =>{
            res.sendFile(path.join(__dirname, '/images/pistol.png'))
        })

        app.use("/static/client.js", (req, res) =>{
            res.sendFile(path.join(__dirname, '/static/client.js'))
        })

        app.use("/static/ClientState.js", (req, res) =>{
            res.sendFile(path.join(__dirname, '/static/ClientState.js'))
        })

        app.use("/pixi.js", (req, res) =>{
            res.sendFile(path.join(__dirname, 'pixi.js'))
        })


    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});