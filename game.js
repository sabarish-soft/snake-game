const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

const shapes = ['square', 'circle', 'diamond', 'triangle'];
const colors = [
    '#C0C0C0', // Silver
    '#FFD700', // Gold
    '#CD7F32', // Bronze
    '#B87333', // Copper
    '#4682B4', // Steel Blue
    '#9966CC', // Amethyst
    '#50C878', // Emerald
    '#E6E8FA'  // Platinum
];

// Separate arrays for positions and segment properties
let snakePositions = [{ x: 10, y: 10 }];
let snakeSegments = [{ shape: 'square', color: '#4CAF50' }];

let food = { 
    x: 15, 
    y: 15,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    dx: 0,
    dy: 0,
    moveCounter: 0,
    moveInterval: 5 // Move every 5 frames
};

// Particle system for explosion effect
let particles = [];
const PARTICLE_COUNT = 15;
const PARTICLE_LIFETIME = 20; // frames
const PARTICLE_SPEED = 3;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.lifetime = PARTICLE_LIFETIME;
        const angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(angle) * PARTICLE_SPEED * (0.5 + Math.random());
        this.dy = Math.sin(angle) * PARTICLE_SPEED * (0.5 + Math.random());
        this.size = 3 + Math.random() * 2;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.lifetime--;
        this.size *= 0.9;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.lifetime / PARTICLE_LIFETIME;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

let dx = 0;
let dy = 0;
let score = 0;
let gameLoop;
let gameSpeed = 200;

function createExplosion(x, y, color) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle(centerX, centerY, color));
    }
}

function drawGame() {
    clearCanvas();
    moveSnake();
    moveFood();
    drawSnake();
    drawFood();
    updateParticles();
    checkCollision();
    updateScore();
}

function clearCanvas() {
    // Darker background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle grid pattern
    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function createMetallicGradient(centerX, centerY, size, color) {
    const gradient = ctx.createRadialGradient(
        centerX - size/3, centerY - size/3, size/10,
        centerX, centerY, size
    );
    
    // Convert hex to RGB for manipulation
    const baseColor = hexToRgb(color);
    const highlight = `rgba(255, 255, 255, 0.9)`;
    const midColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.8)`;
    const shadowColor = `rgba(${baseColor.r * 0.4}, ${baseColor.g * 0.4}, ${baseColor.b * 0.4}, 0.9)`;
    
    gradient.addColorStop(0, highlight);
    gradient.addColorStop(0.1, color);
    gradient.addColorStop(0.5, midColor);
    gradient.addColorStop(0.8, color);
    gradient.addColorStop(1, shadowColor);
    
    return gradient;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function draw3DShape(x, y, shape, color) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    const size = gridSize - 4;
    
    // Enhanced shadow for more depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Create metallic gradient
    ctx.fillStyle = createMetallicGradient(centerX, centerY, size, color);
    ctx.beginPath();
    
    switch(shape) {
        case 'square':
            ctx.fillRect(x * gridSize + 2, y * gridSize + 2, size, size);
            // Add metallic highlights
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.moveTo(x * gridSize + 2, y * gridSize + 2);
            ctx.lineTo(x * gridSize + size + 2, y * gridSize + 2);
            ctx.lineTo(x * gridSize + size + 2, y * gridSize + size + 2);
            ctx.stroke();
            break;
            
        case 'circle':
            ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
            ctx.fill();
            // Add metallic highlights
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.arc(centerX - size/5, centerY - size/5, size/3, 0, Math.PI * 2);
            ctx.stroke();
            break;
            
        case 'diamond':
            ctx.moveTo(centerX, centerY - size/2);
            ctx.lineTo(centerX + size/2, centerY);
            ctx.lineTo(centerX, centerY + size/2);
            ctx.lineTo(centerX - size/2, centerY);
            ctx.closePath();
            ctx.fill();
            // Add metallic highlights
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.moveTo(centerX - size/3, centerY - size/3);
            ctx.lineTo(centerX, centerY - size/2);
            ctx.lineTo(centerX + size/3, centerY - size/3);
            ctx.stroke();
            break;
            
        case 'triangle':
            ctx.moveTo(centerX, centerY - size/2);
            ctx.lineTo(centerX + size/2, centerY + size/2);
            ctx.lineTo(centerX - size/2, centerY + size/2);
            ctx.closePath();
            ctx.fill();
            // Add metallic highlights
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.moveTo(centerX - size/3, centerY);
            ctx.lineTo(centerX, centerY - size/2);
            ctx.lineTo(centerX + size/3, centerY);
            ctx.stroke();
            break;
    }
    
    // Add inner shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawSnake() {
    for (let i = 0; i < snakePositions.length; i++) {
        const pos = snakePositions[i];
        const segment = snakeSegments[i];
        draw3DShape(pos.x, pos.y, segment.shape, segment.color);
    }
}

function drawFood() {
    draw3DShape(food.x, food.y, food.shape, food.color);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].lifetime <= 0) {
            particles.splice(i, 1);
        }
    }
}

function moveFood() {
    food.moveCounter++;
    
    // Change direction randomly every 20 frames
    if (food.moveCounter % 20 === 0) {
        const directions = [
            { dx: 0, dy: 0 },    // stay still
            { dx: 0.2, dy: 0 },  // right
            { dx: -0.2, dy: 0 }, // left
            { dx: 0, dy: 0.2 },  // down
            { dx: 0, dy: -0.2 }  // up
        ];
        const newDir = directions[Math.floor(Math.random() * directions.length)];
        food.dx = newDir.dx;
        food.dy = newDir.dy;
    }

    // Move food every few frames
    if (food.moveCounter % food.moveInterval === 0) {
        let newX = food.x + food.dx;
        let newY = food.y + food.dy;

        // Bounce off walls
        if (newX < 0 || newX >= tileCount) {
            food.dx *= -1;
            newX = food.x + food.dx;
        }
        if (newY < 0 || newY >= tileCount) {
            food.dy *= -1;
            newY = food.y + food.dy;
        }

        // Check if new position overlaps with snake
        const overlapsSnake = snakePositions.some(pos => {
            const distance = Math.sqrt(
                Math.pow(pos.x - newX, 2) + 
                Math.pow(pos.y - newY, 2)
            );
            return distance < 1;
        });

        if (!overlapsSnake) {
            food.x = newX;
            food.y = newY;
        }
    }
}

function moveSnake() {
    const newHead = { 
        x: snakePositions[0].x + dx, 
        y: snakePositions[0].y + dy 
    };

    // Check if snake ate food (using distance for smoother collision)
    const distanceToFood = Math.sqrt(
        Math.pow(newHead.x - food.x, 2) + 
        Math.pow(newHead.y - food.y, 2)
    );

    if (distanceToFood < 1) {
        score += 10;
        createExplosion(food.x, food.y, food.color);
        snakePositions.unshift(newHead);
        snakeSegments.unshift({ shape: food.shape, color: food.color });
        generateFood();
        increaseSpeed();
    } else {
        snakePositions.unshift(newHead);
        snakePositions.pop();
    }
}

function generateFood() {
    const newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: 0,
        dy: 0,
        moveCounter: 0,
        moveInterval: 5
    };
    
    // Make sure food doesn't spawn on snake
    while (snakePositions.some(pos => pos.x === newFood.x && pos.y === newFood.y)) {
        newFood.x = Math.floor(Math.random() * tileCount);
        newFood.y = Math.floor(Math.random() * tileCount);
    }

    food = newFood;
}

function checkCollision() {
    const head = snakePositions[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Self collision
    for (let i = 1; i < snakePositions.length; i++) {
        if (head.x === snakePositions[i].x && head.y === snakePositions[i].y) {
            gameOver();
            return;
        }
    }
}

function updateScore() {
    scoreElement.textContent = score;
}

function increaseSpeed() {
    if (gameSpeed > 80) {
        gameSpeed -= 1;
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, gameSpeed);
    }
}

function gameOver() {
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

function restartGame() {
    snakePositions = [{ x: 10, y: 10 }];
    snakeSegments = [{ shape: 'square', color: '#4CAF50' }];
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 200;
    generateFood();
    gameOverElement.style.display = 'none';
    gameLoop = setInterval(drawGame, gameSpeed);
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// Start the game
gameLoop = setInterval(drawGame, gameSpeed);
