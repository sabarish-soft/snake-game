import { jest } from '@jest/globals';
import { Particle } from '../js/Particle.js';
import { PARTICLE_LIFETIME, PARTICLE_SPEED } from '../js/config.js';

describe('Particle', () => {
    let mockRandom;

    beforeEach(() => {
        mockRandom = jest.spyOn(Math, 'random');
        mockRandom.mockReturnValue(0.5);
    });

    afterEach(() => {
        mockRandom.mockRestore();
    });

    describe('initialization', () => {
        test('should initialize with correct properties', () => {
            const x = 100;
            const y = 100;
            const color = '#ff0000';
            const particle = new Particle(x, y, color);

            expect(particle.x).toBe(x);
            expect(particle.y).toBe(y);
            expect(particle.color).toBe(color);
            expect(particle.lifetime).toBe(PARTICLE_LIFETIME);
            expect(particle.size).toBe(4); // 3 + (0.5 * 2) = 4
            
            // With Math.random = 0.5, angle = π
            // dx = cos(π) * PARTICLE_SPEED * (0.5 + 0.5)
            // dy = sin(π) * PARTICLE_SPEED * (0.5 + 0.5)
            expect(particle.dx).toBeCloseTo(-PARTICLE_SPEED);
            expect(particle.dy).toBeCloseTo(0);
        });
    });

    describe('update', () => {
        test('should update position and properties', () => {
            const particle = new Particle(100, 100, '#ff0000');
            const initialX = particle.x;
            const initialY = particle.y;
            const initialSize = particle.size;
            const initialLifetime = particle.lifetime;

            particle.update();

            expect(particle.x).toBe(initialX + particle.dx);
            expect(particle.y).toBe(initialY + particle.dy);
            expect(particle.lifetime).toBe(initialLifetime - 1);
            expect(particle.size).toBe(initialSize * 0.9);
        });
    });

    describe('isDead', () => {
        test('should return true when lifetime is 0 or less', () => {
            const particle = new Particle(100, 100, '#ff0000');
            particle.lifetime = PARTICLE_LIFETIME;
            expect(particle.isDead()).toBe(false);

            particle.lifetime = 1;
            expect(particle.isDead()).toBe(false);

            particle.lifetime = 0;
            expect(particle.isDead()).toBe(true);

            particle.lifetime = -1;
            expect(particle.isDead()).toBe(true);
        });
    });

    describe('draw', () => {
        test('should draw particle with correct properties', () => {
            const mockContext = {
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                fillStyle: '',
                globalAlpha: 1
            };

            const particle = new Particle(100, 100, '#ff0000');
            particle.lifetime = PARTICLE_LIFETIME / 2;
            
            particle.draw(mockContext);

            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalledWith(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );
            expect(mockContext.fillStyle).toBe(particle.color);
            // Don't test globalAlpha since it's set internally by the Particle class
            expect(mockContext.fill).toHaveBeenCalled();
        });
    });
});
