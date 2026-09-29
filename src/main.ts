import { Application, Container, Graphics } from 'pixi.js';

const app = new Application();

await app.init({
  background: '#5c94fc',
  resizeTo: window,
});

document.body.appendChild(app.canvas);

// =================================
// CONFIGURAÇÕES
// =================================

const WORLD_WIDTH = 3000;
const GROUND_Y = 660;

// =================================
// MUNDO DO JOGO
// =================================

const world = new Container();

app.stage.addChild(world);

// =================================
// CHÃO
// =================================

const ground = new Graphics();

ground.rect(0, GROUND_Y, WORLD_WIDTH, 100);
ground.fill('#5c4033');

world.addChild(ground);

// =================================
// PLATAFORMAS
// =================================

function createPlatform(
  x: number,
  y: number,
  width: number,
  height: number
) {
  const platform = new Graphics();

  platform.rect(0, 0, width, height);
  platform.fill('#5c4033');

  platform.x = x;
  platform.y = y;

  world.addChild(platform);

  return platform;
}

createPlatform(350, 520, 200, 30);
createPlatform(800, 450, 200, 30);
createPlatform(1300, 520, 250, 30);
createPlatform(1900, 430, 200, 30);
createPlatform(2400, 500, 300, 30);

// =================================
// PLAYER
// =================================

const player = new Graphics();

player.rect(0, 0, 40, 60);
player.fill('#ff3333');

player.x = 100;
player.y = 600;

world.addChild(player);

// =================================
// PORTÃO
// =================================

const gate = new Graphics();

gate.rect(0, 0, 80, 160);
gate.fill('#333333');

gate.x = 2800;
gate.y = 500;

world.addChild(gate);

// =================================
// CONTROLES
// =================================

const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

// =================================
// FÍSICA
// =================================

let velocityY = 0;

const gravity = 0.7;
const jumpForce = -14;
const speed = 5;

let onGround = false;

// =================================
// GAME LOOP
// =================================

app.ticker.add(() => {

  // -------------------------------
  // MOVIMENTO
  // -------------------------------

  if (keys['a'] || keys['arrowleft']) {
    player.x -= speed;
  }

  if (keys['d'] || keys['arrowright']) {
    player.x += speed;
  }

  // -------------------------------
  // GRAVIDADE
  // -------------------------------

  velocityY += gravity;

  player.y += velocityY;

  onGround = false;

  // -------------------------------
  // CHÃO
  // -------------------------------

  if (player.y + player.height >= GROUND_Y) {

    player.y = GROUND_Y - player.height;

    velocityY = 0;

    onGround = true;
  }

  // -------------------------------
  // PULO
  // -------------------------------

  if (
    (keys['w'] ||
      keys['arrowup'] ||
      keys[' ']) &&
    onGround
  ) {

    velocityY = jumpForce;

    onGround = false;
  }

  // -------------------------------
  // LIMITES DO MAPA
  // -------------------------------

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > WORLD_WIDTH) {
    player.x = WORLD_WIDTH - player.width;
  }

  // =================================
  // CÂMERA
  // =================================

  const screenCenter = app.screen.width / 2;

  world.x = screenCenter - player.x;

});