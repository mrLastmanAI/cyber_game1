import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.platforms = null;
        this.obstacles = null;
        this.isGameOver = false;
        this.score = 0;
        this.highScore = 0;
        this.distance = 0;
        this.gameSpeed = 400;
        this.lastPlatformX = 0;
        this.lastObstacleX = 0;
    }

    preload() {
        // Load image assets
        this.load.image('player', 'assets/player.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('spike', 'assets/spike.png');
        this.load.image('laser', 'assets/laser.png');
        this.load.image('drone', 'assets/drone.png');
        this.load.image('background', 'assets/background.png');
    }

    create() {
        // Load high score
        this.highScore = parseInt(localStorage.getItem('cyberRunnerHighScore') || '0');

        // Create parallax background
        this.createBackground();

        // Create physics groups
        this.platforms = this.physics.add.staticGroup();
        this.obstacles = this.physics.add.group();

        // Create initial platforms
        this.createInitialPlatforms();

        // Create player
        this.createPlayer();

        // Setup collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

        // Create UI
        this.createUI();

        // Setup input
        this.input.on('pointerdown', this.jump, this);

        // Start game loop
        this.isGameOver = false;
        this.distance = 0;
        this.score = 0;
    }

    update(time, delta) {
        if (this.isGameOver) {
            return;
        }

        // Update distance and score
        this.distance += this.gameSpeed * delta / 1000;
        this.score = Math.floor(this.distance / 10);
        this.scoreText.setText('Score: ' + this.score);

        // Gradually increase game speed
        this.gameSpeed = 400 + this.score / 10;

        // Update parallax background
        this.updateBackground(delta);

        // Generate new platforms and obstacles
        this.generateLevel();

        // Clean up off-screen objects
        this.cleanupObjects();

        // Update obstacles
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.body) {
                obstacle.body.velocity.x = -this.gameSpeed;
            }
        });

        // Check if player fell off screen
        if (this.player.y > this.cameras.main.height + 100) {
            this.gameOver();
        }
    }


    createBackground() {
        // Create parallax background with loaded image
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.bgLayers = [];

        // Add background image (tiled for parallax)
        const bg1 = this.add.tileSprite(0, 0, width * 3, height, 'background');
        bg1.setOrigin(0, 0);
        bg1.setDepth(-2);
        this.bgLayers.push({ obj: bg1, speed: 0.2 });

        // Add second layer for depth
        const bg2 = this.add.tileSprite(0, 0, width * 3, height, 'background');
        bg2.setOrigin(0, 0);
        bg2.setDepth(-1);
        bg2.setAlpha(0.3);
        this.bgLayers.push({ obj: bg2, speed: 0.4 });

        // Grid floor overlay
        this.gridGraphics = this.add.graphics();
        this.gridGraphics.setDepth(0);
        this.gridOffset = 0;
    }

    updateBackground(delta) {
        // Update parallax layers with TileSprite
        this.bgLayers.forEach(layer => {
            layer.obj.tilePositionX += this.gameSpeed * layer.speed * delta / 1000;
            layer.obj.x = this.cameras.main.scrollX;
        });

        // Update grid overlay
        this.gridOffset += this.gameSpeed * delta / 1000;
        if (this.gridOffset > 50) {
            this.gridOffset = 0;
        }

        const scrollX = this.cameras.main.scrollX;
        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(1, 0x00ffff, 0.1);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Horizontal lines
        for (let i = 0; i < height; i += 50) {
            this.gridGraphics.lineBetween(scrollX, i, scrollX + width, i);
        }

        // Vertical lines with offset for movement
        for (let i = -50; i < width + 50; i += 50) {
            this.gridGraphics.lineBetween(scrollX + i - this.gridOffset, 0, scrollX + i - this.gridOffset, height);
        }
    }

    createPlayer() {
        // Start player at a safe position above the platform
        const startY = 450; // Platform is at 550, so player will be on top
        this.player = this.physics.add.sprite(200, startY, 'player');
        this.player.setCollideWorldBounds(false);
        this.player.setBounce(0);
        this.player.setScale(0.6); // Scale down to reasonable size
        // Adjust body size to match visible sprite
        this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.8);
        this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.1);
    }

    createInitialPlatforms() {
        // Create starting platforms at fixed height
        const platformY = 550; // Fixed platform height
        for (let i = 0; i < 8; i++) {
            const x = i * 200;
            const platform = this.platforms.create(x, platformY, 'platform');
            platform.setScale(0.15, 0.4); // Scale to reasonable platform size
            platform.refreshBody();
            this.lastPlatformX = x;
        }
    }

    generateLevel() {
        const cameraRight = this.cameras.main.scrollX + this.cameras.main.width;
        const platformY = 550; // Same fixed height for all platforms

        // Generate platforms
        while (this.lastPlatformX < cameraRight + 800) {
            this.lastPlatformX += 200; // Fixed spacing for easier gameplay
            const platform = this.platforms.create(this.lastPlatformX, platformY, 'platform');
            platform.setScale(0.15, 0.4); // Scale to reasonable platform size
            platform.refreshBody();
        }

        // Generate obstacles
        if (this.lastObstacleX < cameraRight + 600) {
            this.lastObstacleX += Phaser.Math.Between(400, 700);
            this.createRandomObstacle(this.lastObstacleX, platformY);
        }

        // Camera follows player
        this.cameras.main.scrollX = this.player.x - 200;
    }

    createRandomObstacle(x, platformY) {
        const type = Phaser.Math.Between(0, 2); // Only 3 types for now, no gaps
        let obstacle;

        switch (type) {
            case 0: // Spike - on the platform
                const spikeY = platformY - 40; // Place spike ON the platform
                obstacle = this.obstacles.create(x, spikeY, 'spike');
                obstacle.setScale(0.5); // Scale down to reasonable size
                obstacle.body.setSize(obstacle.width * 0.7, obstacle.height * 0.7);
                break;
            case 1: // Laser (vertical beam)
                const laserY = platformY - 100; // Laser from above
                obstacle = this.obstacles.create(x, laserY, 'laser');
                obstacle.setScale(0.8, 1.2); // Make it vertical beam size
                obstacle.body.setSize(obstacle.width * 0.6, obstacle.height);
                break;
            case 2: // Drone (flying)
                const droneY = platformY - 120; // Drone flying above platform
                obstacle = this.obstacles.create(x, droneY, 'drone');
                obstacle.setScale(0.4); // Scale down to reasonable size
                obstacle.body.setSize(obstacle.width * 0.7, obstacle.height * 0.7);
                // Make drone hover
                this.tweens.add({
                    targets: obstacle,
                    y: obstacle.y + 20,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
                break;
        }

        if (obstacle) {
            obstacle.body.allowGravity = false;
            obstacle.body.velocity.x = -this.gameSpeed;
        }
    }

    cleanupObjects() {
        const cameraLeft = this.cameras.main.scrollX - 200;

        // Remove off-screen platforms
        this.platforms.children.entries.forEach(platform => {
            if (platform.x < cameraLeft) {
                platform.destroy();
            }
        });

        // Remove off-screen obstacles
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.x < cameraLeft) {
                obstacle.destroy();
            }
        });
    }

    jump() {
        if (this.isGameOver) {
            // Restart game
            this.scene.restart();
            return;
        }

        // Allow jump only if on ground
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-800);
        }
    }

    hitObstacle(player, obstacle) {
        this.gameOver();
    }

    gameOver() {
        if (this.isGameOver) return;

        this.isGameOver = true;

        // Stop player
        this.player.setTint(0xff0066);
        this.player.setVelocity(0, 0);

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cyberRunnerHighScore', this.highScore.toString());
            this.highScoreText.setText('HIGH SCORE: ' + this.highScore + ' [NEW!]');
        }

        // Show game over text
        const centerX = this.cameras.main.scrollX + this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.rectangle(centerX, centerY, 600, 300, 0x000000, 0.8);

        const gameOverText = this.add.text(centerX, centerY - 50, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'monospace',
            color: '#ff0066',
            stroke: '#00ffff',
            strokeThickness: 4
        });
        gameOverText.setOrigin(0.5);

        const finalScoreText = this.add.text(centerX, centerY + 20, 'Score: ' + this.score, {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#00ffff'
        });
        finalScoreText.setOrigin(0.5);

        const restartText = this.add.text(centerX, centerY + 80, 'TAP TO RESTART', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ff00ff'
        });
        restartText.setOrigin(0.5);

        // Blink restart text
        this.tweens.add({
            targets: restartText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    createUI() {
        // Score text - bigger and easier to read
        this.scoreText = this.add.text(30, 30, 'Score: 0', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 6
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(100);

        // High score text - bigger
        this.highScoreText = this.add.text(30, 90, 'HIGH SCORE: ' + this.highScore, {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 5
        });
        this.highScoreText.setScrollFactor(0);
        this.highScoreText.setDepth(100);
    }
}
