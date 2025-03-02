import { GRID_SIZE, PARTICLE_COUNT, INITIAL_GAME_SPEED } from './config.js';
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { Particle } from './Particle.js';
import { Renderer } from './Renderer.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.tileCount = canvas.width / GRID_SIZE;
        this.renderer = new Renderer(canvas);
        this.snake = new Snake();
        this.food = new Food(this.tileCount);
        this.particles = [];
        this.score = 0;
        this.gameSpeed = INITIAL_GAME_SPEED;
        this.gameLoop = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.snake.dy === 0) this.snake.setDirection(0, -1);
                    break;
                case 'ArrowDown':
                    if (this.snake.dy === 0) this.snake.setDirection(0, 1);
                    break;
                case 'ArrowLeft':
                    if (this.snake.dx === 0) this.snake.setDirection(-1, 0);
                    break;
                case 'ArrowRight':
                    if (this.snake.dx === 0) this.snake.setDirection(1, 0);
                    break;
            }
        });
    }

    createExplosion(x, y, color) {
        const centerX = x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = y * GRID_SIZE + GRID_SIZE / 2;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            this.particles.push(new Particle(centerX, centerY, color));
        }
    }

    update() {
        // Update snake
        this.snake.move();
        
        // Check collisions
        if (this.snake.checkCollision(this.tileCount)) {
            this.gameOver();
            return;
        }
        
        // Check food collision
        const head = this.snake.positions[0];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            document.getElementById('score').textContent = this.score;
            this.createExplosion(this.food.x, this.food.y, this.food.color);
            this.snake.grow(this.food.shape, this.food.color);
            this.food.reset();
            // Increase game speed
            this.gameSpeed = Math.max(50, INITIAL_GAME_SPEED - (this.score * 5));
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }
        
        // Update food position
        this.food.update(this.snake.positions);
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return !particle.isDead();
        });
        
        this.draw();
    }

    draw() {
        this.renderer.clearCanvas();
        this.renderer.drawBackground();
        this.snake.draw(this.renderer);
        this.food.draw(this.renderer);
        this.renderer.drawParticles(this.particles);
    }

    start() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }

    restart() {
        document.getElementById('gameOver').style.display = 'none';
        this.snake.reset();
        this.food.reset();
        this.particles = [];
        this.score = 0;
        this.gameSpeed = INITIAL_GAME_SPEED;
        document.getElementById('score').textContent = '0';
        this.start();
    }
}
