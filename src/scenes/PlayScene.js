import BaseScene from './BaseScene';

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    // we will pass the name of the identifier of the scene
    super('PlayScene', config);

    this.initialBirdPosition = {
      x: 80,
      y: 300,
    };
    this.bird = null;
    this.pipes = null;

    this.isPaused = false;

    this.pipeVerticalDistanceRange = [150, 250];
    this.pipeHorizontalDistanceRange = [500, 550];
    this.pipeHorizontalDistance = 0;
    this.flapVelocity = 280;

    this.score = 0;
    this.scoreText = '';
    this.bestScoreText = '';

    this.currentDifficulty = 'easy';
    this.difficulties = {
      easy: {
        pipeHorizontalDistanceRange: [400, 450],
        pipeVerticalDistanceRange: [200, 250],
      },
      normal: {
        pipeHorizontalDistanceRange: [300, 340],
        pipeVerticalDistanceRange: [150, 190],
      },
      hard: {
        pipeHorizontalDistanceRange: [250, 310],
        pipeVerticalDistanceRange: [120, 170],
      },
    };
  }

  create() {
    this.currentDifficulty = 'easy';

    super.create();

    this.createBird();

    this.createPipes();

    this.createColliders();

    this.createScores();

    this.createPause();

    this.handleInputs();

    this.listenToEvents();
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
      .setOrigin(0);
    this.bird.body.gravity.y = 600;
    this.bird.setScale(0.07);
    this.bird.setCollideWorldBounds(true);
  }
  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes
        .create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes
        .create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  // what to do when collision occurs between objects
  createColliders() {
    // this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createScores() {
    this.score = 0;
    const bestScore = localStorage.getItem('bestScore');
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, {
      fontSize: '32px',
      fill: '#00',
    });
    this.bestScoreText = this.add.text(
      16,
      52,
      `Best Score: ${bestScore || 0}`,
      {
        fontSize: '18px',
        fill: '#00',
      }
    );
  }

  createPause() {
    this.isPaused = false;
    const pauseBtn = this.add
      .image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setScale(2)
      .setOrigin(1);

    pauseBtn.on('pointerdown', () => {
      this.isPaused = true;
      this.physics.pause();
      this.scene.pause();
      // when we do not want to close the current scene and launch the new scene
      this.scene.launch('PauseScene');
    });
  }

  handleInputs() {
    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard.on('keydown_SPACE', this.flap, this);
  }

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }
    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add
        .text(
          ...this.screenCenter,
          'Fly in: ' + this.initialTime,
          this.fontOptions
        )
        .setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText('Fly in: ' + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  placePipe(uPipe, lPipe) {
    // pipeHorizontalDistance += 400;
    const difficulty = this.difficulties[this.currentDifficulty];
    console.log('Current Difficulty: ', this.currentDifficulty);
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(
      ...difficulty.pipeVerticalDistanceRange
    );
    const pipeVerticalPosition = Phaser.Math.Between(
      0 + 20,
      this.config.height - 20 - pipeVerticalDistance
    );
    let pipeHorizontalDistance =
      rightMostX +
      Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);

    uPipe.x = pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
  }

  getRightMostPipe() {
    let rightMostX = 0;

    this.pipes.getChildren().forEach(function (pipe) {
      rightMostX = Math.max(pipe.x, rightMostX);
    });
    return rightMostX;
  }

  recyclePipes() {
    const tempPipes = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right <= 0) {
        // recycle Pipe
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score < 4) {
      this.currentDifficulty = 'easy';
    }
    if (this.score >= 4 && this.score < 7) {
      this.currentDifficulty = 'normal';
    }
    if (this.score >= 7) {
      this.currentDifficulty = 'hard';
    }
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore');
    const bestScore = bestScoreText && parseInt(bestScoreText);
    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score);
      this.bestScoreText.setText(`Best Score: ${this.score}`);
    }
  }

  gameOver() {
    this.physics.pause();
    this.bird.setTint(0xee4824);

    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  checkGameStatus() {
    if (
      this.bird.getBounds().bottom >= this.config.height ||
      this.bird.y <= 0
    ) {
      this.gameOver();
    }
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  flap() {
    if (this.isPaused) {
      return;
    }
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score ${this.score}`);
  }
}

export default PlayScene;
