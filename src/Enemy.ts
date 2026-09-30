import { Graphics } from 'pixi.js';

export class Enemy extends Graphics {

  speed = 1.5;
  direction = 1;

  startX: number;
  endX: number;

  constructor(
    x: number,
    startX: number,
    endX: number
  ) {

    super();

    // Corpo do inimigo
    this.rect(
      0,
      0,
      40,
      40
    );

    this.fill('#8e44ad');

    // Posição horizontal
    this.x = x;

    // Coloca o inimigo em cima do chão
    this.y = 660 - this.height;

    this.startX = startX;
    this.endX = endX;
  }

  update() {

    this.x +=
      this.speed *
      this.direction;

    if (this.x <= this.startX) {

      this.x =
        this.startX;

      this.direction = 1;
    }

    if (this.x >= this.endX) {

      this.x =
        this.endX;

      this.direction = -1;
    }
  }
}