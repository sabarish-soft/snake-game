import { GRID_SIZE } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gradientCache = new Map();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        // Add subtle grid pattern
        this.ctx.strokeStyle = '#252525';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.canvas.width; i += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }

    createMetallicGradient(x, y, color) {
        const gradientKey = `${x},${y},${color}`;
        if (this.gradientCache.has(gradientKey)) {
            return this.gradientCache.get(gradientKey);
        }

        const gradient = this.ctx.createLinearGradient(
            x * GRID_SIZE,
            y * GRID_SIZE,
            (x + 1) * GRID_SIZE,
            (y + 1) * GRID_SIZE
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        this.gradientCache.set(gradientKey, gradient);
        return gradient;
    }

    draw3DShape(x, y, shape, color) {
        const centerX = x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = y * GRID_SIZE + GRID_SIZE / 2;
        const size = GRID_SIZE - 4;
        
        // Enhanced shadow for more depth
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillStyle = this.createMetallicGradient(x, y, color);
        
        switch(shape) {
            case 'square':
                this.ctx.fillRect(x * GRID_SIZE + 2, y * GRID_SIZE + 2, size, size);
                // Add metallic highlights
                this.ctx.beginPath();
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(x * GRID_SIZE + 2, y * GRID_SIZE + 2);
                this.ctx.lineTo(x * GRID_SIZE + size + 2, y * GRID_SIZE + 2);
                this.ctx.lineTo(x * GRID_SIZE + size + 2, y * GRID_SIZE + size + 2);
                this.ctx.stroke();
                break;
                
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'diamond':
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, y * GRID_SIZE + 2);
                this.ctx.lineTo(x * GRID_SIZE + size + 2, centerY);
                this.ctx.lineTo(centerX, y * GRID_SIZE + size + 2);
                this.ctx.lineTo(x * GRID_SIZE + 2, centerY);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, y * GRID_SIZE + 2);
                this.ctx.lineTo(x * GRID_SIZE + size + 2, y * GRID_SIZE + size + 2);
                this.ctx.lineTo(x * GRID_SIZE + 2, y * GRID_SIZE + size + 2);
                this.ctx.closePath();
                this.ctx.fill();
                break;
        }
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    drawParticles(particles) {
        particles.forEach(particle => particle.draw(this.ctx));
    }
}
