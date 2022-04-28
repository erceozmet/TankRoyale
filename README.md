
# Tank Royale
Members: Sinan Unan, Dogacan Colak, Erce Ozmetin


## Usage


- npm start to start the backend
- connect to `localhost:2567/client` to add a client


## Structure

TODO client.js ve client state.js iki tane mi olsun submitledigimizde

- `src`
    - `rooms`: 
        - `MyRoom.ts`: 
        - `schema`: 
            - `GameMap.ts`:
            - `GameObject.ts`:
            - `MyRoomState.ts`:
            - `Obstacle.ts`:
            - `Projectile.ts`:
            - `Tank.ts`:
            - `Weapon.ts`:
    - `images`: contains the images of the game 
    - `arena.config.ts`: contains the configurations for the Colyseus server

### Additional directories

- `lib`: contains the compiled typescript
- `node_modules` contain the necessary modules for node.js
- `index.ts`: main entry point, register an empty room handler and attach [`@colyseus/monitor`](https://github.com/colyseus/colyseus-monitor)
- `loadtest/example.ts`: scriptable client for the loadtest tool (see `npm run loadtest`)
- `test`: contains some tests