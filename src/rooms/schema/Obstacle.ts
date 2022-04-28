import { GameObject } from "./GameObject";

export class Obstacle extends GameObject {

    constructor(height: number, width: number) {
        super("images/obstacle.png", height, width);
        
    }

    getType(): string {
        return "obstacle";
    }

    // places for all obstacles in the map
    static all_obstacles() {
        const MIN_DIM = 3;
        let obstacles = [

            // width, height, x, y 
            // if negative, counts from the right

            // top right
            // horizontal
            [35, MIN_DIM, -(50), 10],
            [35, MIN_DIM, -35, 55], 
            [45, MIN_DIM, -(80), 70],
            [15, 15, -50, 30],

            // vertical
            [MIN_DIM, 35, -15, 10],
            [MIN_DIM, 40, -(80), 30],

            // bottom left
            // horizontal
            [35, MIN_DIM, 0, -110],
            [25, MIN_DIM, 10, -95],
        
            [15, MIN_DIM, 10, -17],
            [15, MIN_DIM, 25, -27],
            [35, MIN_DIM, 40, -17],
            
            [15, MIN_DIM, 25, -75],
            [15, MIN_DIM, 25, -45],
            

            // vertical
            [MIN_DIM, 75, 10, -92],
            [MIN_DIM, 10, 22, -27],
            [MIN_DIM, 10, 40, -27],

            [MIN_DIM, 20, 22, -75],
            [MIN_DIM, 33, 40, -75],

            // center
            // horizontal
            [10, MIN_DIM, 113, 115],
            [10, MIN_DIM, 113, 142],
            [10, MIN_DIM, 133, 115],
            [10, MIN_DIM, 133, 142],
            
            [60, MIN_DIM, 97, 95],
            [60, MIN_DIM, 97, 160],

            // vertical
            [MIN_DIM, 30, 110, 115],
            [MIN_DIM, 30, 143, 115],

            [MIN_DIM, 25, 94, 95],
            [MIN_DIM, 25, 94, 138],
            [MIN_DIM, 25, 157, 95],
            [MIN_DIM, 25, 157, 138],

            // top left
            // horizontal
            [100, MIN_DIM, 20, 25],
            [45, MIN_DIM, 20, 40],
            [45, MIN_DIM, 75, 40],
            
            // vertical
            [MIN_DIM, 50, 62, 43],
            [MIN_DIM, 50, 75, 43],

        ] 
        return obstacles;
    }



}
