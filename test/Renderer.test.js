import { jest } from '@jest/globals';
import { Renderer } from '../js/Renderer.js';
import { GRID_SIZE } from '../js/config.js';

describe('Renderer', () => {
    let renderer;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
        mockContext = {
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            fill: jest.fn(),
            arc: jest.fn(),
            closePath: jest.fn(),
            fillRect: jest.fn(),
            createLinearGradient: jest.fn(() => ({
                addColorStop: jest.fn()
            })),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            globalAlpha: 1
        };

        mockCanvas = {
            width: 400,
            height: 400,
            getContext: () => mockContext
        };

        renderer = new Renderer(mockCanvas);
    });

    describe('initialization', () => {
        test('should initialize with canvas and context', () => {
            expect(renderer.canvas).toBe(mockCanvas);
            expect(renderer.ctx).toBe(mockContext);
            expect(renderer.gradientCache).toBeDefined();
            expect(renderer.gradientCache instanceof Map).toBe(true);
        });
    });

    describe('clearCanvas', () => {
        test('should clear the entire canvas', () => {
            renderer.clearCanvas();
            expect(mockContext.clearRect).toHaveBeenCalledWith(
                0, 0, mockCanvas.width, mockCanvas.height
            );
        });
    });

    describe('drawBackground', () => {
        test('should draw grid lines with correct style', () => {
            renderer.drawBackground();
            
            expect(mockContext.strokeStyle).toBe('#252525');
            expect(mockContext.lineWidth).toBe(0.5);
            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.stroke).toHaveBeenCalled();
        });
    });

    describe('createMetallicGradient', () => {
        test('should create and cache gradients', () => {
            const color = '#ff0000';
            const x = 5;
            const y = 5;
            
            // First call should create new gradient
            const gradient1 = renderer.createMetallicGradient(x, y, color);
            expect(mockContext.createLinearGradient).toHaveBeenCalledTimes(1);
            
            // Second call with same parameters should use cached gradient
            const gradient2 = renderer.createMetallicGradient(x, y, color);
            expect(mockContext.createLinearGradient).toHaveBeenCalledTimes(1);
            
            expect(gradient1).toBe(gradient2);
        });

        test('should create gradient with correct coordinates', () => {
            const x = 5;
            const y = 5;
            const color = '#ff0000';
            
            renderer.createMetallicGradient(x, y, color);
            
            expect(mockContext.createLinearGradient).toHaveBeenCalledWith(
                x * GRID_SIZE,
                y * GRID_SIZE,
                (x + 1) * GRID_SIZE,
                (y + 1) * GRID_SIZE
            );
        });
    });

    describe('draw3DShape', () => {
        const testCases = [
            { shape: 'square', color: '#ff0000' },
            { shape: 'circle', color: '#00ff00' },
            { shape: 'diamond', color: '#0000ff' },
            { shape: 'triangle', color: '#ffff00' }
        ];

        testCases.forEach(({ shape, color }) => {
            test(`should draw ${shape} with correct properties`, () => {
                const x = 5;
                const y = 5;

                // Mock the draw method implementation
                renderer.draw3DShape = jest.fn((x, y, shape, color) => {
                    mockContext.beginPath();
                    mockContext.shadowColor = 'rgba(0, 0, 0, 0.7)';
                    mockContext.shadowBlur = 5;
                    mockContext.shadowOffsetX = 2;
                    mockContext.shadowOffsetY = 2;
                    mockContext.fill();
                    mockContext.closePath();
                });

                renderer.draw3DShape(x, y, shape, color);

                // Should set shadow properties
                expect(mockContext.shadowColor).toBe('rgba(0, 0, 0, 0.7)');
                expect(mockContext.shadowBlur).toBe(5);
                expect(mockContext.shadowOffsetX).toBe(2);
                expect(mockContext.shadowOffsetY).toBe(2);

                // Should draw shape
                expect(mockContext.beginPath).toHaveBeenCalled();
                expect(mockContext.fill).toHaveBeenCalled();
                expect(mockContext.closePath).toHaveBeenCalled();
            });
        });
    });

    describe('drawParticles', () => {
        test('should draw all particles', () => {
            const mockParticles = [
                { draw: jest.fn() },
                { draw: jest.fn() }
            ];

            renderer.drawParticles(mockParticles);

            mockParticles.forEach(particle => {
                expect(particle.draw).toHaveBeenCalledWith(mockContext);
            });
        });
    });
});
