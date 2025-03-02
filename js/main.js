import { Game } from './Game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

window.restartGame = () => game.restart();
game.start();
