import Phaser from 'phaser';

const config = {
  // renderer
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { y: 400 },
      debug: true,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

new Phaser.Game(config);

const VELOCITY = 200;
const PIPES_TO_RENDER = 4;
const flapVelocity = 250;
const initialBirdPosition = {
  x: config.width * 0.1,
  y: config.height / 2,
};

let bird = null;

let pipes = null;
let pipeHorizontalDistance = 0;
const pipeVerticalDistanceRange = [150, 250];
const pipeHorizontalDistanceRange = [500, 550];

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('bird', '/assets/BirdPng/Frame-1.png');
  this.load.image('pipe', './assets/pipe.png');
}

function create() {
  this.add.image(0, 0, 'sky').setOrigin(0);

  bird = this.physics.add
    .sprite(initialBirdPosition.x, initialBirdPosition.y, 'bird')
    .setOrigin(0);
  bird.body.gravity.y = 400;
  bird.setScale(0.07);

  pipes = this.physics.add.group();

  for (let i = 0; i < PIPES_TO_RENDER; i++) {
    const upperPipe = pipes.create(0, 0, 'pipe').setOrigin(0, 1);
    const lowerPipe = pipes.create(0, 0, 'pipe').setOrigin(0, 0);

    placePipe(upperPipe, lowerPipe);
  }

  pipes.setVelocityX(-200);

  this.input.on('pointerdown', flap);
  this.input.keyboard.on('keydown_SPACE', flap);
}

function placePipe(uPipe, lPipe) {
  // pipeHorizontalDistance += 400;
  const rightMostX = getRightMostPipe();
  const pipeVerticalDistance = Phaser.Math.Between(
    ...pipeVerticalDistanceRange
  );
  const pipeVerticalPosition = Phaser.Math.Between(
    0 + 20,
    config.height - 20 - pipeVerticalDistance
  );
  let pipeHorizontalDistance =
    rightMostX + Phaser.Math.Between(...pipeHorizontalDistanceRange);

  uPipe.x = pipeHorizontalDistance;
  uPipe.y = pipeVerticalPosition;

  lPipe.x = uPipe.x;
  lPipe.y = uPipe.y + pipeVerticalDistance;
}

// this function will run of every frame
function recyclePipes() {
  const tempPipes = [];
  pipes.getChildren().forEach((pipe) => {
    if (pipe.getBounds().right <= 0) {
      // recycle Pipe
      tempPipes.push(pipe);
      if (tempPipes.length === 2) {
        placePipe(...tempPipes);
      }
    }
  });
}

function getRightMostPipe() {
  let rightMostX = 0;

  pipes.getChildren().forEach(function (pipe) {
    rightMostX = Math.max(pipe.x, rightMostX);
  });
  return rightMostX;
}

function restartBirdPosition() {
  bird.x = initialBirdPosition.x;
  bird.y = initialBirdPosition.y;
  bird.body.velocity.y = 0;
}
function flap() {
  bird.body.velocity.y = -flapVelocity;
}

function update(time, delta) {
  if (bird.y > config.height || bird.y < -bird.height) {
    restartBirdPosition();
  }
  recyclePipes();
}
