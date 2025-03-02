import { jest } from '@jest/globals';
import { Game } from '../js/Game.js';
import { Snake } from '../js/Snake.js';
import { Food } from '../js/Food.js';
import { Renderer } from '../js/Renderer.js';
import { GRID_SIZE, INITIAL_GAME_SPEED } from '../js/config.js';

// Mock modules
const mockSnake = {
    move: jest.fn(),
    checkCollision: jest.fn(() => false),
    grow: jest.fn(),
    positions: [{ x: 0, y: 0 }],
    reset: jest.fn(),
    draw: jest.fn(),
    setDirection: jest.fn(),
    dx: 0,
    dy: 0
};

const mockFood = {
    x: 5,
    y: 5,
    color: '#ff0000',
    shape: 'square',
    update: jest.fn(),
    reset: jest.fn(),
    draw: jest.fn()
};

const mockContext = {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
    font: '',
    textAlign: '',
    fillText: jest.fn(),
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
    })),
    closePath: jest.fn()
};

const mockRenderer = {
    clearCanvas: jest.fn(),
    drawBackground: jest.fn(),
    drawParticles: jest.fn(),
    draw3DShape: jest.fn(),
    ctx: mockContext
};

jest.unstable_mockModule('../js/Snake.js', () => ({
    Snake: jest.fn(() => mockSnake)
}));

jest.unstable_mockModule('../js/Food.js', () => ({
    Food: jest.fn(() => mockFood)
}));

jest.unstable_mockModule('../js/Renderer.js', () => ({
    Renderer: jest.fn(() => mockRenderer)
}));

describe('Game', () => {
    let game;
    let mockCanvas;
    let mockSetInterval;
    let mockClearInterval;
    let mockScore;
    let mockGameOver;
    let mockFinalScore;
    let eventListeners;

    beforeEach(() => {
        mockCanvas = {
            width: 400,
            height: 400,
            getContext: jest.fn(() => mockContext)
        };

        mockScore = { textContent: '0' };
        mockGameOver = { style: { display: 'none' } };
        mockFinalScore = { textContent: '0' };

        // Ensure the mock objects behave like DOM elements
        Object.defineProperty(mockScore, 'textContent', {
            get() { return this._textContent; },
            set(value) { this._textContent = String(value); },
            enumerable: true,
            configurable: true
        });
        mockScore._textContent = '0';

        Object.defineProperty(mockFinalScore, 'textContent', {
            get() { return this._textContent; },
            set(value) { this._textContent = String(value); },
            enumerable: true,
            configurable: true
        });
        mockFinalScore._textContent = '0';

        Object.defineProperty(mockGameOver.style, 'display', {
            get() { return this._display; },
            set(value) { this._display = String(value); },
            enumerable: true,
            configurable: true
        });
        mockGameOver.style._display = 'none';

        // Track event listeners
        eventListeners = {};

        // Mock document before creating game instance
        const mockGetElementById = jest.fn((id) => {
            switch (id) {
                case 'score':
                    return mockScore;
                case 'gameOver':
                    return mockGameOver;
                case 'finalScore':
                    return mockFinalScore;
                default:
                    return null;
            }
        });

        const mockAddEventListener = jest.fn((event, handler) => {
            eventListeners[event] = handler;
        });

        const mockDispatchEvent = jest.fn((event) => {
            const handler = eventListeners[event.type];
            if (handler) handler(event);
        });

        Object.defineProperty(global, 'document', {
            value: {
                getElementById: mockGetElementById,
                addEventListener: mockAddEventListener,
                dispatchEvent: mockDispatchEvent
            },
            writable: true
        });

        mockSetInterval = jest.fn(() => 123);
        mockClearInterval = jest.fn();
        global.setInterval = mockSetInterval;
        global.clearInterval = mockClearInterval;

        // Reset mock states
        jest.clearAllMocks();
        mockSnake.checkCollision.mockReturnValue(false);

        game = new Game(mockCanvas);
        game.snake = mockSnake;
        game.food = mockFood;
        game.renderer = mockRenderer;
        game.gameLoop = 123;
    });

    describe('initialization', () => {
        test('should initialize game components', () => {
            expect(game.snake).toBeDefined();
            expect(game.food).toBeDefined();
            expect(game.renderer).toBeDefined();
            expect(game.particles).toEqual([]);
            expect(game.score).toBe(0);
            expect(game.gameSpeed).toBe(INITIAL_GAME_SPEED);
        });
    });

    describe('update', () => {
        test('should update game state', () => {
            game.update();
            expect(mockSnake.move).toHaveBeenCalled();
            expect(mockFood.update).toHaveBeenCalled();
            expect(mockRenderer.clearCanvas).toHaveBeenCalled();
            expect(mockRenderer.drawBackground).toHaveBeenCalled();
            expect(mockSnake.draw).toHaveBeenCalled();
            expect(mockFood.draw).toHaveBeenCalled();
        });

        test('should handle game over', () => {
            mockSnake.checkCollision.mockReturnValue(true);
            game.update();
            expect(mockClearInterval).toHaveBeenCalledWith(game.gameLoop);
            expect(mockGameOver.style.display).toBe('block');
            expect(mockFinalScore.textContent).toBe('0');
        });

        test('should handle food collision', () => {
            game.snake.positions[0] = { x: 5, y: 5 };
            game.food.x = 5;
            game.food.y = 5;
            game.update();
            expect(game.score).toBe(1);
            expect(mockScore.textContent).toBe('1');
            expect(mockSnake.grow).toHaveBeenCalledWith(mockFood.shape, mockFood.color);
            expect(mockFood.reset).toHaveBeenCalled();
            expect(game.gameSpeed).toBe(INITIAL_GAME_SPEED - 5);
            expect(mockClearInterval).toHaveBeenCalledWith(game.gameLoop);
            expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), game.gameSpeed);
        });
    });

    describe('controls', () => {
        test('should handle arrow key controls', () => {
            const events = [
                { key: 'ArrowUp' },
                { key: 'ArrowDown' },
                { key: 'ArrowLeft' },
                { key: 'ArrowRight' }
            ];

            events.forEach(event => {
                const keyEvent = new KeyboardEvent('keydown', event);
                eventListeners.keydown(keyEvent);
            });

            expect(mockSnake.setDirection).toHaveBeenCalledTimes(4);
        });
    });

    describe('game lifecycle', () => {
        test('should start game loop', () => {
            game.start();
            expect(mockClearInterval).toHaveBeenCalledWith(game.gameLoop);
            expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), game.gameSpeed);
        });

        test('should restart game', () => {
            game.restart();
            expect(mockSnake.reset).toHaveBeenCalled();
            expect(mockFood.reset).toHaveBeenCalled();
            expect(game.score).toBe(0);
            expect(game.gameSpeed).toBe(INITIAL_GAME_SPEED);
            expect(mockGameOver.style.display).toBe('none');
            expect(mockScore.textContent).toBe('0');
            expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), game.gameSpeed);
        });
    });
});
