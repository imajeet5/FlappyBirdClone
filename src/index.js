import Phaser from 'phaser';

const config = {
  // renderer
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

new Phaser.Game(config);

let bird = null;
let totalDelta = null;

// Loading assets, such as images, music, animation
function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('bird', '/assets/bird.png');
}

function create() {
  this.add.image(0, 0, 'sky').setOrigin(0);
  // sprint is an game object that has more properties that we can play with
  bird = this.physics.add
    .sprite(config.width * 0.1, config.height / 2, 'bird')
    .setOrigin(0);

  // bird.body.gravity.y = 200;

  // console.log(bird.body);
  // debugger;
}

function update(time, delta) {
  if (totalDelta >= 1000) {
    // console.log(totalDelta);
    console.log(bird.body.velocity.y);
    totalDelta = 0;
  }
  totalDelta += delta;
}
