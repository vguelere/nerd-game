import { Graphics } from 'pixi.js';

export class Player extends Graphics {

  velocityY = 0;

  speed = 5;
  gravity = 0.7;
  jumpForce = -20;

  onGround = false;

  constructor() {

    super();

    this.rect(
      0,
      0,
      40,
      60
    );

    this.fill('#ff3333');

    this.x = 100;
    this.y = 600;
  }

  jump() {

    if (!this.onGround) {
      return;
    }

    this.velocityY =
      this.jumpForce;

    this.onGround = false;
  }

  moveLeft() {

    this.x -= this.speed;
  }

  moveRight() {

    this.x += this.speed;
  }

  applyGravity() {

    this.velocityY +=
      this.gravity;

    this.y +=
      this.velocityY;
  }
}