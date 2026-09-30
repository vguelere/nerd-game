import { Graphics } from 'pixi.js';

export class Player extends Graphics {

 invulnerable = false;

  velocityY = 0;

  speed = 5;
  gravity = 0.7;
  jumpForce = -14;

  onGround = false;

  health = 3;
  maxHealth = 3;

  constructor() {
    super();

    this.rect(0, 0, 40, 60);
    this.fill('#ff3333');
  }

  jump() {
    if (!this.onGround) return;

    this.velocityY = this.jumpForce;
    this.onGround = false;
  }

  moveLeft() {
    this.x -= this.speed;
  }

  moveRight() {
    this.x += this.speed;
  }

  applyGravity() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;
  }

takeDamage(amount: number) {

  if (this.invulnerable) {
    return;
  }

  this.health -= amount;

  if (this.health < 0) {
    this.health = 0;
  }

  this.invulnerable = true;

  setTimeout(() => {
    this.invulnerable = false;
  }, 1000);
}
}