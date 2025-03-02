import { jest } from '@jest/globals';

// Mock canvas and context
const mockContext = {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    fillRect: jest.fn(),
    fillText: jest.fn(),
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
    globalAlpha: 1,
    font: ''
};

global.document = {
    getElementById: jest.fn(),
    createElement: jest.fn(() => ({
        getContext: () => mockContext,
        width: 400,
        height: 400
    }))
};

global.window = {
    requestAnimationFrame: jest.fn(),
    cancelAnimationFrame: jest.fn()
};

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});
