import { jest } from '@jest/globals';
import { Food } from '../js/Food.js';
import { SHAPES, COLORS } from '../js/config.js';

describe('Food', () => {
    let food;
    const TILE_COUNT = 20;

    beforeEach(() => {
        // Mock Math.random to return predictable values
        const mockMath = Object.create(global.Math);
        mockMath.random = () => 0.5;
        global.Math = mockMath;
        
        food = new Food(TILE_COUNT);
    });

    describe('initialization', () => {
        test('should initialize with valid position and properties', () => {
            expect(food.x).toBe(10); // 0.5 * 20 = 10
            expect(food.y).toBe(10);
            expect(SHAPES).toContain(food.shape);
            expect(Object.values(COLORS)).toContain(food.color);
            expect(food.dx).toBe(0);
            expect(food.dy).toBe(0);
            expect(food.moveCounter).toBe(0);
            expect(food.moveInterval).toBe(5);
        });
    });

    describe('movement', () => {
        test('should not move before moveInterval is reached', () => {
            const initialX = food.x;
            const initialY = food.y;
            food.dx = 1;
            food.dy = 1;
            
            food.update([]);
            expect(food.moveCounter).toBe(1);
            expect(food.x).toBe(initialX);
            expect(food.y).toBe(initialY);
        });

        test('should bounce off walls', () => {
            // Set up food at edge
            food.x = 0;
            food.y = 0;
            food.dx = -1;
            food.dy = -1;
            food.moveCounter = food.moveInterval; // Force move

            food.update([]);

            // Should reverse direction
            expect(food.dx).toBe(1);
            expect(food.dy).toBe(1);
        });

        test('should avoid snake positions', () => {
            food.x = 10;
            food.y = 10;
            food.dx = 1;
            food.dy = 0;
            food.moveCounter = food.moveInterval;

            const snakePositions = [
                { x: 11, y: 10 } // Position where food would move
            ];

            food.update(snakePositions);

            // Should not move to snake position
            expect(food.x).toBe(10);
            expect(food.y).toBe(10);
            // Direction should be reversed
            expect(food.dx).toBe(1); // Food should choose a new random direction
        });
    });

    describe('reset', () => {
        test('should reset to valid position and properties', () => {
            // Set invalid values
            food.x = -1;
            food.y = -1;
            food.dx = 5;
            food.dy = 5;
            food.moveCounter = 10;

            food.reset();

            // Check reset values (with mocked Math.random = 0.5)
            expect(food.x).toBe(10);
            expect(food.y).toBe(10);
            expect(food.dx).toBe(0);
            expect(food.dy).toBe(0);
            expect(food.moveCounter).toBe(0);
            expect(SHAPES).toContain(food.shape);
            expect(Object.values(COLORS)).toContain(food.color);
        });
    });
});
