import { Application, Container, Graphics } from 'pixi.js';
import { Player } from './Player';
import { Enemy } from './Enemy'

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
// MUNDO
// =================================

const world = new Container();

app.stage.addChild(world);

// =================================
// CHÃO
// =================================

const ground = new Graphics();

ground.rect(0, 0, WORLD_WIDTH, 100);
ground.fill('#5c4033');

ground.x = 0;
ground.y = GROUND_Y;

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

const platforms = [
  createPlatform(350, 520, 200, 30),
  createPlatform(800, 450, 200, 30),
  createPlatform(1300, 520, 250, 30),
  createPlatform(1900, 430, 200, 30),
  createPlatform(2400, 500, 300, 30),
];

// =================================
// PLAYER
// =================================

const player = new Player();

world.addChild(player);

// =================================
// INIMIGO
// =================================

const enemy = new Enemy(700, 620);

world.addChild(enemy);

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
// COLISÃO LATERAL
// =================================

function checkHorizontalCollision(
  player: Player,
  platform: Graphics,
  previousX: number
): boolean {

  const playerTop = player.y;
  const playerBottom = player.y + player.height;

  const platformTop = platform.y;
  const platformBottom = platform.y + platform.height;

  const verticalCollision =
    playerBottom > platformTop &&
    playerTop < platformBottom;

  const playerRight =
    player.x + player.width;

  const playerLeft =
    player.x;

  const platformRight =
    platform.x + platform.width;

  const platformLeft =
    platform.x;

  // Bateu na esquerda da plataforma
  const hitLeft =
    previousX + player.width <= platformLeft &&
    playerRight >= platformLeft;

  // Bateu na direita da plataforma
  const hitRight =
    previousX >= platformRight &&
    playerLeft <= platformRight;

  return (
    verticalCollision &&
    (hitLeft || hitRight)
  );
}


// =================================
// COLISÃO COM PLATAFORMA
// =================================

function checkPlatformCollision(
  player: Player,
  platform: Graphics,
  previousY: number
): boolean {

  const playerBottom =
    player.y + player.height;

  const platformTop =
    platform.y;

  const horizontalCollision =
    player.x + player.width > platform.x &&
    player.x < platform.x + platform.width;

  const wasAbove =
    previousY + player.height <= platformTop;

  const crossedPlatform =
    playerBottom >= platformTop;

  return (
    player.velocityY >= 0 &&
    horizontalCollision &&
    wasAbove &&
    crossedPlatform
  );
}

// =================================
// GAME LOOP
// =================================

app.ticker.add(() => {

  // Guarda posição anterior
  const previousY = player.y;

  // =================================
  // MOVIMENTO
  // =================================



  // MOVIMENTO DO PLAYER
  // ...

  enemy.update();

  // resto do código

// =================================
// MOVIMENTO HORIZONTAL
// =================================

const previousX = player.x;

if (
  keys['a'] ||
  keys['arrowleft']
) {
  player.moveLeft();
}

if (
  keys['d'] ||
  keys['arrowright']
) {
  player.moveRight();
}


// =================================
// COLISÃO LATERAL
// =================================

for (const platform of platforms) {

  if (
    checkHorizontalCollision(
      player,
      platform,
      previousX
    )
  ) {

    // Estava vindo pela esquerda
    if (previousX + player.width <= platform.x) {

      player.x =
        platform.x - player.width;

    }

    // Estava vindo pela direita
    else if (previousX >= platform.x + platform.width) {

      player.x =
        platform.x + platform.width;
    }
  }
}
  // =================================
  // GRAVIDADE
  // =================================

  player.applyGravity();

  player.onGround = false;

  // =================================
  // CHÃO
  // =================================

  if (
    player.y + player.height >= GROUND_Y
  ) {

    player.y =
      GROUND_Y - player.height;

    player.velocityY = 0;

    player.onGround = true;
  }

  // =================================
  // PLATAFORMAS
  // =================================

  for (const platform of platforms) {

    if (
      checkPlatformCollision(
        player,
        platform,
        previousY
      )
    ) {

      player.y =
        platform.y - player.height;

      player.velocityY = 0;

      player.onGround = true;
    }
  }

  // =================================
  // PULO
  // =================================

  if (
    keys['w'] ||
    keys['arrowup'] ||
    keys[' ']
  ) {
    player.jump();
  }

  // =================================
  // LIMITES DO MAPA
  // =================================

  if (player.x < 0) {
    player.x = 0;
  }

  if (
    player.x + player.width >
    WORLD_WIDTH
  ) {
    player.x =
      WORLD_WIDTH - player.width;
  }

  // =================================
  // CÂMERA
  // =================================

  const screenCenter =
    app.screen.width / 2;

  world.x =
    screenCenter - player.x;
});