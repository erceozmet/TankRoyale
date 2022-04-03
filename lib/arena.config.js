"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arena_1 = __importDefault(require("@colyseus/arena"));
const monitor_1 = require("@colyseus/monitor");
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
        gameServer.define('battle', MyRoom_1.MyRoom)
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
        app.use("/client", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '/static/game.html'));
        });
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor_1.monitor());
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});