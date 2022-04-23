import { GameObject } from "./GameObject";

export class Obstacle extends GameObject {

    constructor(height: number, width: number) {
        super("images/obstacle.png", height, width);
        
    }

    getType(): string {
        return "obstacle";
    }

}
