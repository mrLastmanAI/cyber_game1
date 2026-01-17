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
        // Create pixel art assets programmatically
        this.createAssets();
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

    createAssets() {
        // Create player sprite (cyberpunk character - pixel art)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Cyberpunk character with neon outline
        playerGraphics.fillStyle(0x00ffff, 1);
        playerGraphics.fillRect(12, 0, 8, 4); // head
        playerGraphics.fillRect(10, 4, 12, 12); // body
        playerGraphics.fillRect(6, 8, 4, 8); // left arm
        playerGraphics.fillRect(22, 8, 4, 8); // right arm
        playerGraphics.fillRect(10, 16, 4, 12); // left leg
        playerGraphics.fillRect(18, 16, 4, 12); // right leg

        // Neon glow effect
        playerGraphics.lineStyle(2, 0xff00ff, 0.8);
        playerGraphics.strokeRect(10, 0, 12, 28);

        playerGraphics.generateTexture('player', 32, 32);
        playerGraphics.destroy();

        // Create platform sprite (cyberpunk platform)
        const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        platformGraphics.fillStyle(0x0a0a0f, 1);
        platformGraphics.fillRect(0, 0, 200, 20);

        // Neon edges
        platformGraphics.lineStyle(2, 0x00ffff, 1);
        platformGraphics.strokeRect(0, 0, 200, 20);

        // Grid pattern
        platformGraphics.lineStyle(1, 0xff00ff, 0.3);
        for (let i = 20; i < 200; i += 20) {
            platformGraphics.lineBetween(i, 0, i, 20);
        }

        platformGraphics.generateTexture('platform', 200, 20);
        platformGraphics.destroy();

        // Create spike obstacle
        const spikeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        spikeGraphics.fillStyle(0xff0066, 1);
        spikeGraphics.fillTriangle(0, 30, 15, 0, 30, 30);
        spikeGraphics.lineStyle(2, 0xff00ff, 1);
        spikeGraphics.strokeTriangle(0, 30, 15, 0, 30, 30);
        spikeGraphics.generateTexture('spike', 32, 32);
        spikeGraphics.destroy();

        // Create laser obstacle (horizontal)
        const laserGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        laserGraphics.fillStyle(0xff0000, 1);
        laserGraphics.fillRect(0, 14, 4, 4);
        laserGraphics.fillStyle(0xff0066, 0.6);
        laserGraphics.fillRect(0, 12, 4, 8);
        laserGraphics.generateTexture('laser', 4, 32);
        laserGraphics.destroy();

        // Create drone obstacle
        const droneGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        droneGraphics.fillStyle(0xff0066, 1);
        droneGraphics.fillRect(8, 12, 16, 8);
        droneGraphics.fillRect(0, 14, 32, 4);
        droneGraphics.fillStyle(0x00ffff, 1);
        droneGraphics.fillRect(4, 16, 4, 2);
        droneGraphics.fillRect(24, 16, 4, 2);
        droneGraphics.generateTexture('drone', 32, 32);
        droneGraphics.destroy();
    }

    createBackground() {
        // Create layered parallax background with cyberpunk city
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background layers
        this.bgLayers = [];

        // Far background - dark city skyline
        const bg1 = this.add.graphics();
        bg1.fillStyle(0x0a0a0f, 1);
        bg1.fillRect(0, 0, width * 2, height);

        // Add some distant buildings
        for (let i = 0; i < 20; i++) {
            const x = i * 150;
            const h = 100 + Math.random() * 200;
            bg1.fillStyle(0x1a1a2e, 0.5);
            bg1.fillRect(x, height - h, 100, h);

            // Random windows
            bg1.fillStyle(Math.random() > 0.5 ? 0x00ffff : 0xff00ff, 0.3);
            for (let j = 0; j < 10; j++) {
                bg1.fillRect(x + 10 + (j % 3) * 30, height - h + 20 + Math.floor(j / 3) * 30, 10, 10);
            }
        }

        this.bgLayers.push({ obj: bg1, speed: 0.1 });

        // Mid background - neon signs
        const bg2 = this.add.graphics();
        for (let i = 0; i < 30; i++) {
            const x = i * 100;
            const color = [0x00ffff, 0xff00ff, 0xff0066][Math.floor(Math.random() * 3)];
            bg2.fillStyle(color, 0.6);
            bg2.fillRect(x, 50 + Math.random() * 100, 20, 20);
        }
        this.bgLayers.push({ obj: bg2, speed: 0.3 });

        // Grid floor
        this.gridGraphics = this.add.graphics();
        this.gridOffset = 0;
    }

    updateBackground(delta) {
        // Update parallax layers
        this.bgLayers.forEach(layer => {
            layer.obj.x -= this.gameSpeed * layer.speed * delta / 1000;
            if (layer.obj.x <= -this.cameras.main.width) {
                layer.obj.x = 0;
            }
        });

        // Update grid
        this.gridOffset += this.gameSpeed * delta / 1000;
        if (this.gridOffset > 50) {
            this.gridOffset = 0;
        }

        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(1, 0x00ffff, 0.2);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Horizontal lines
        for (let i = 0; i < height; i += 50) {
            this.gridGraphics.lineBetween(0, i, width, i);
        }

        // Vertical lines with offset for movement
        for (let i = -50; i < width + 50; i += 50) {
            this.gridGraphics.lineBetween(i - this.gridOffset, 0, i - this.gridOffset, height);
        }
    }

    createPlayer() {
        // Start player at a safe position above the platform
        const startY = 450; // Platform is at 550, so player will be on top
        this.player = this.physics.add.sprite(200, startY, 'player');
        this.player.setCollideWorldBounds(false);
        this.player.setBounce(0);
        this.player.setScale(2); // Make player bigger
        this.player.body.setSize(24, 28);
    }

    createInitialPlatforms() {
        // Create starting platforms at fixed height
        const platformY = 550; // Fixed platform height
        for (let i = 0; i < 8; i++) {
            const x = i * 200;
            const platform = this.platforms.create(x, platformY, 'platform');
            platform.setScale(1.2); // Make platforms slightly bigger
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
            platform.setScale(1.2);
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
                const spikeY = platformY - 30; // Place spike ON the platform
                obstacle = this.obstacles.create(x, spikeY, 'spike');
                obstacle.setScale(1.5); // Make bigger
                obstacle.body.setSize(28, 28);
                break;
            case 1: // Laser (vertical beam)
                const laserY = platformY - 100; // Laser from above
                obstacle = this.obstacles.create(x, laserY, 'laser');
                obstacle.setScale(2, 6); // Make bigger and taller
                obstacle.body.setSize(8, 180);
                break;
            case 2: // Drone (flying)
                const droneY = platformY - 150; // Drone flying above platform
                obstacle = this.obstacles.create(x, droneY, 'drone');
                obstacle.setScale(1.5); // Make bigger
                obstacle.body.setSize(28, 28);
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
