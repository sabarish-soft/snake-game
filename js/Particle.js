import { PARTICLE_LIFETIME, PARTICLE_SPEED } from './config.js';

export class Particle {
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

    isDead() {
        return this.lifetime <= 0;
    }
}
