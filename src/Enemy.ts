import { Graphics } from 'pixi.js';

export class Enemy extends Graphics {

  speed = 1.5;
  direction = 1;

  constructor(x: number, y: number) {
    super();

    // Corpo do inimigo
    this.rect(0, 0, 40, 40);
    this.fill('#8e44ad');

    this.x = x;
    this.y = y;
  }

  update() {
    this.x += this.speed * this.direction;
  }

  turnAround() {
    this.direction *= -1;
  }
}