import { jest } from '@jest/globals';
import { Snake } from '../js/Snake.js';
import { COLORS } from '../js/config.js';

describe('Snake', () => {
    let snake;

    beforeEach(() => {
        snake = new Snake();
    });

    describe('initialization', () => {
        test('should initialize with correct default values', () => {
            expect(snake.positions).toHaveLength(1);
            expect(snake.positions[0]).toEqual({ x: 10, y: 10 });
            expect(snake.segments).toHaveLength(1);
            expect(snake.segments[0]).toEqual({ 
                shape: 'square', 
                color: COLORS.emerald 
            });
            expect(snake.dx).toBe(0);
            expect(snake.dy).toBe(0);
        });
    });

    describe('movement', () => {
        test('should move in the current direction', () => {
            snake.setDirection(1, 0); // Move right
            snake.move();
            expect(snake.positions[0]).toEqual({ x: 11, y: 10 });
        });

        test('should not allow reversing direction', () => {
            snake.positions = [
                { x: 10, y: 10 },
                { x: 9, y: 10 }
            ];
            snake.segments = [
                { shape: 'square', color: COLORS.gold },
                { shape: 'square', color: COLORS.emerald }
            ];
            snake.dx = 1;
            snake.dy = 0;
            
            // Try to move left (opposite direction)
            snake.setDirection(-1, 0);
            
            // Direction should remain right
            expect(snake.dx).toBe(1);
            expect(snake.dy).toBe(0);
        });
    });

    describe('growth', () => {
        test('should grow with new shape and color at head', () => {
            snake.dx = 1;
            snake.dy = 0;
            snake.grow('circle', COLORS.gold);
            
            expect(snake.positions).toHaveLength(2);
            expect(snake.segments).toHaveLength(2);
            expect(snake.positions[0]).toEqual({ x: 11, y: 10 }); // New head
            expect(snake.segments[0]).toEqual({ shape: 'circle', color: COLORS.gold });
        });
    });

    describe('collision detection', () => {
        test('should detect wall collision', () => {
            snake.positions[0] = { x: -1, y: 10 };
            expect(snake.checkCollision(20)).toBe(true);

            snake.positions[0] = { x: 20, y: 10 };
            expect(snake.checkCollision(20)).toBe(true);
        });

        test('should detect self collision', () => {
            snake.positions = [
                { x: 5, y: 5 },
                { x: 6, y: 5 },
                { x: 5, y: 5 } // Overlapping position
            ];
            expect(snake.checkCollision(20)).toBe(true);
        });

        test('should not detect collision in valid position', () => {
            snake.positions = [
                { x: 5, y: 5 },
                { x: 6, y: 5 },
                { x: 7, y: 5 }
            ];
            expect(snake.checkCollision(20)).toBe(false);
        });
    });
});
