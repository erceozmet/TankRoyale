"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arena_1 = __importDefault(require("@colyseus/arena"));
const monitor_1 = require("@colyseus/monitor");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
/**
 * Import your Room files
 */
const MyRoom_1 = require("./rooms/MyRoom");
exports.default = arena_1.default({
    getId: () => "Tank Royale",
    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('battle_room', MyRoom_1.MyRoom)
            .on("create", (room) => console.log("room created:", room.roomId))
            .on("dispose", (room) => console.log("room disposed:", room.roomId))
            .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
            .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
        ;
    },
    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("Connected to backend server");
        });
        const allowedOrigins = ['wss://xq-zci.colyseus.dev', 'https://xq-zci.colyseus.dev'];
        const options = {
            origin: allowedOrigins
        };
        app.use(cors_1.default(options));
        app.use("/client", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/static/game.html'));
        });
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor_1.monitor());
        app.use("/images/tank.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/tank.png'));
        });
        app.use("/images/barrel.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/barrel.png'));
        });
        app.use("/images/background.jpeg", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/background.jpeg'));
        });
        app.use("/images/explosion.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/explosion.png'));
        });
        app.use("/images/heart.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/heart.png'));
        });
        app.use("/images/projectile.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/projectile.png'));
        });
        app.use("/images/black.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/black.png'));
        });
        app.use("/images/shotgun.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/shotgun.png'));
        });
        app.use("/images/sniper.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/sniper.png'));
        });
        app.use("/images/smg.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/smg.png'));
        });
        app.use("/images/pistol.png", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/images/pistol.png'));
        });
        app.use("/static/client.js", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/static/client.js'));
        });
        app.use("/static/ClientState.js", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/static/ClientState.js'));
        });
        app.use("/pixi.js", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, 'pixi.js'));
        });
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
