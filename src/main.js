import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
        orientation: Phaser.Scale.LANDSCAPE,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 2000 },
            debug: false
        }
    },
    backgroundColor: '#0a0a0f',
    scene: [GameScene],
    audio: {
        disableWebAudio: false
    }
};

const game = new Phaser.Game(config);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => e.preventDefault());
