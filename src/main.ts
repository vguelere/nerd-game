import { Application, Graphics } from 'pixi.js';

const app = new Application();

await app.init({
  background: '#5c94fc',
  width: 1280,
  height: 720,
});

document.body.appendChild(app.canvas);

// ========================
// PLAYER
// ========================

const player = new Graphics();

player.rect(0, 0, 40, 60);
player.fill('#ff3333');

player.x = 100;
player.y = 600;

app.stage.addChild(player);

// ========================
// CHÃO
// ========================

const ground = new Graphics();

ground.rect(0, 660, 1280, 60);
ground.fill('#5c4033');

app.stage.addChild(ground);

// ========================
// PLATAFORMAS
// ========================

const platform = new Graphics();

platform.rect(350, 520, 200, 30);
platform.fill('#5c4033');

app.stage.addChild(platform);

// ========================
// PORTÃO
// ========================

const gate = new Graphics();

gate.rect(1100, 500, 80, 160);
gate.fill('#333333');

app.stage.addChild(gate);

// ========================
// CONTROLES
// ========================

const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

// ========================
// FÍSICA
// ========================

let velocityY = 0;

const gravity = 0.7;
const jumpForce = -12;
const speed = 8;

let onGround = false;

// ========================
// GAME LOOP
// ========================

app.ticker.add(() => {

  // Movimento horizontal

  if (keys['a'] || keys['arrowleft']) {
    player.x -= speed;
  }

  if (keys['d'] || keys['arrowright']) {
    player.x += speed;
  }

  // Gravidade

  velocityY += gravity;

  player.y += velocityY;

  // Chão

  if (player.y + player.height >= 660) {

    player.y = 660 - player.height;

    velocityY = 0;

    onGround = true;

  } else {

    onGround = false;

  }

  // Pulo

  if (
    (keys['w'] || keys['arrowup'] || keys[' ']) &&
    onGround
  ) {

    velocityY = jumpForce;

    onGround = false;

  }

});