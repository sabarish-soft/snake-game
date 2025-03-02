import { COLORS } from './config.js';

export class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        this.positions = [{ x: 10, y: 10 }];
        this.segments = [{ 
            shape: 'square', 
            color: COLORS.emerald // Make sure we're using the color from config
        }];
        this.dx = 0;
        this.dy = 0;
    }

    move() {
        const head = { ...this.positions[0] };
        head.x += this.dx;
        head.y += this.dy;
        this.positions.unshift(head);
        this.positions.pop();
    }

    grow(foodShape, foodColor) {
        const head = { ...this.positions[0] };
        head.x += this.dx;
        head.y += this.dy;
        
        // Add new head position
        this.positions.unshift(head);
        
        // Add new segment at the head with food's properties
        this.segments.unshift({ shape: foodShape, color: foodColor });
    }

    checkCollision(tileCount) {
        const head = this.positions[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return true;
        }
        
        // Self collision
        for (let i = 1; i < this.positions.length; i++) {
            if (head.x === this.positions[i].x && head.y === this.positions[i].y) {
                return true;
            }
        }
        
        return false;
    }

    draw(renderer) {
        this.positions.forEach((pos, index) => {
            const segment = this.segments[index];
            renderer.draw3DShape(pos.x, pos.y, segment.shape, segment.color);
        });
    }

    setDirection(dx, dy) {
        // Prevent reversing direction
        if (this.positions.length > 1 && 
            this.positions[0].x + dx === this.positions[1].x && 
            this.positions[0].y + dy === this.positions[1].y) {
            return;
        }
        this.dx = dx;
        this.dy = dy;
    }
}
