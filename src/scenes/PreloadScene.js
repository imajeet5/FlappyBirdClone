import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('bird', '/assets/BirdPng/Frame-1.png');
    this.load.image('pipe', './assets/pipe.png');
    this.load.image('pause', './assets/pause.png');
    this.load.image('back', './assets/back.png');
  }

  create() {
    this.scene.start('MenuScene');
    // this.scene.start('PlayScene');
  }
}
``
export default PreloadScene;
