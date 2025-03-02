import { SHAPES, COLORS } from './config.js';

export class Food {
    constructor(tileCount) {
        this.tileCount = tileCount;
        this.reset();
    }

    reset() {
        this.x = Math.floor(Math.random() * this.tileCount);
        this.y = Math.floor(Math.random() * this.tileCount);
        this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        // Get a random color key and use it to get the color value
        const colorKeys = Object.keys(COLORS);
        const randomColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        this.color = COLORS[randomColorKey];
        this.dx = 0;
        this.dy = 0;
        this.moveCounter = 0;
        this.moveInterval = 5;
    }

    update(snakePositions) {
        if (++this.moveCounter >= this.moveInterval) {
            this.moveCounter = 0;
            
            if (Math.random() < 0.1) {
                this.dx = Math.floor(Math.random() * 3) - 1;
                this.dy = Math.floor(Math.random() * 3) - 1;
            }

            let newX = this.x + this.dx;
            let newY = this.y + this.dy;

            if (newX < 0 || newX >= this.tileCount) {
                this.dx *= -1;
                newX = this.x + this.dx;
            }
            if (newY < 0 || newY >= this.tileCount) {
                this.dy *= -1;
                newY = this.y + this.dy;
            }

            // Check if new position overlaps with snake
            const overlapsSnake = snakePositions.some(pos => pos.x === newX && pos.y === newY);
            if (!overlapsSnake) {
                this.x = newX;
                this.y = newY;
            }
        }
    }

    draw(renderer) {
        renderer.draw3DShape(this.x, this.y, this.shape, this.color);
    }
}
