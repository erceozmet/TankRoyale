
# Tank Royale
Members: Sinan Unan, Dogacan Colak, Erce Ozmetin


## Usage

- to run it locally
    - install npm
    - run `npm start` on the terminal to start the backend
    - connect to `localhost:2567/client` to add a client
- or connect to `https://erceozmet.github.io/TankRoyale/` to join online


## Structure

- `src`
    - `rooms`: contains the backend code
        - `MyRoom.ts`: Contains all room specific functions
        - `schema`: directory containing all schemas which are syncable blocks for Colyseus 
            - `GameMap.ts`: class for the game map. contains all synced and unsynced game information
            - `GameObject.ts`: an abstract class for a GameObject
            - `Tank.ts`: extensive class for the tank/player game object
            - `Obstacle.ts`: class for the obstacle game object
            - `Projectile.ts`:  class for the projectile game object
            - `Weapon.ts`: class and subclasses (smg, pistol, etc.) for the weapon game object 
    - `static`: contains the frontend code
        - `client.js`: the main program for the frontend. creates the frontend and processes server messages
        - `ClientState.ts`: An example client state containing all game information and game objects. Two instances used as the map and the minimap.
        - `index.html`: html of the frontend
    - `images`: contains the images of the game 
    - `arena.config.ts`: contains the configurations for the Colyseus server

### Additional directories

- `lib`: contains the compiled typescript
- `node_modules` contain the necessary modules for node.js
- `index.ts`: main entry point, register an empty room handler and attach [`@colyseus/monitor`](https://github.com/colyseus/colyseus-monitor)
- `loadtest/example.ts`: scriptable client for the loadtest tool (see `npm run loadtest`)
- `test`: contains some tests