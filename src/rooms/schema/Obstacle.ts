import { GameObject } from "./GameObject";

export class Obstacle extends GameObject {

    constructor(height: number, width: number) {
        super("images/obstacle.png", height, width);
        
    }

    getType(): string {
        return "obstacle";
    }

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
            // [35, MIN_DIM, 45, -110],
            [25, MIN_DIM, 10, -95],
            // [35, MIN_DIM, 45, -95],

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
            [100, MIN_DIM, 20, 30],
            [45, MIN_DIM, 20, 40],
            [45, MIN_DIM, 75, 40],
            
            // vertical
            [MIN_DIM, 50, 62, 43],
            [MIN_DIM, 50, 75, 43],


            // [MIN_DIM, 10, 110, 110],
            // [MIN_DIM, 10, 110, 137],
            // [MIN_DIM, 10, 130, 110],
            // [MIN_DIM, 10, 130, 137],

            

        ] 
        return obstacles;
    }


//     random_obstacle(): Obstacle {
//         let obstacle_length = Math.round(Math.random() * 30 + 10);
//         let obstacle;
//         if (Math.random() > 0.5){
//             obstacle = new Obstacle(3, obstacle_length);
//         }
//         else{
//             obstacle = new Obstacle(obstacle_length, 3);
//         }
//         return obstacle;
//     }

//     static obstacle_L(): Array<Obstacle> {
//         let obstacle_length = Math.round(Math.random() * 30 + 10);
//         let obstacle1 = new Obstacle(3, obstacle_length);
//         obstacle_length = Math.round(Math.random() * 30 + 10);
//         let obstacle2 = new Obstacle(obstacle_length, 3);
//         let ret = new Array<Obstacle>(2);
//         ret[0] = obstacle1;
//         ret[1] = obstacle2;
//         return ret;
//     }

//     static obstacle_corridor(): Array<Obstacle> {
//         let obstacle_length = Math.round(Math.random() * 60 + 15);
//         let obstacle1, obstacle2;
//         if (Math.random() > 0.5){
//             obstacle1 = new Obstacle(3, obstacle_length);
//             obstacle2 = new Obstacle(3, obstacle_length);
//         } else {
//             obstacle1 = new Obstacle(obstacle_length, 3);
//             obstacle2 = new Obstacle(obstacle_length, 3);
//         }
        
//         let ret = new Array<Obstacle>(2);
//         ret[0] = obstacle1;
//         ret[1] = obstacle2;
//         return ret;
//     }
//     static assign_coordinates(dims :{height:number, width:number}, obstacles : Array<GameObject>, type: String) : Array<[number, number]>  {
//         switch (type) {
//             case 'L': 
//             {return Obstacle.assign_coordinates_L(dims, obstacles);}
//             case 'corridor': 
//             {return Obstacle.assign_coordinates_corridor(dims, obstacles);}
//         }
//     }

//     static assign_coordinates_L(dims: {height:number, width:number}, obstacles: Array<GameObject>): Array<[number, number]> {
//         let x1 = Math.floor(Math.random() * dims.height);
//         let y1 = Math.floor(Math.random() * dims.width);
//         let x2, y2;
//         if (Math.random() > 0.5) {
//             x2 = x1;
//         } else {
//             x2 = x1 + obstacles[0].width - obstacles[1].width;
//         }
//         if (Math.random() > 0.5) {
//             y2 = y1 + obstacles[0].height
//         } else {
//             y2 = y1 - obstacles[1].height;
//         }
//         let ret = new Array<[number, number]>(2);
//         ret[0] = [x1, y1];
//         ret[1] = [x2, y2];
//         return ret;
//     }

//     static assign_coordinates_corridor(dims: {height:number, width:number}, obstacles: Array<GameObject>): Array<[number, number]> {
//         let x1 = Math.floor(Math.random() * dims.height);
//         let y1 = Math.floor(Math.random() * dims.width);
//         let x2, y2;
//         if (obstacles[0].height == 3) {
//             x2 = x1;
//             y2 = y1 + 10;
//         } else {
//             x2 = x1 + 10;
//             y2 = y1;
//         }
//         let ret = new Array<[number, number]>(2);
//         ret[0] = [x1, y1];
//         ret[1] = [x2, y2];
//         return ret;
//     }

    



}
