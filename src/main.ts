import {
  Application,
  Container,
  Graphics,
  Text
} from 'pixi.js';

import { Player } from './Player';
import { Enemy } from './Enemy';

const app = new Application();

await app.init({
  background: '#5c94fc',
  resizeTo: window,
});

document.body.appendChild(app.canvas);

// =================================
// CONFIGURAÇÕES
// =================================

const WORLD_LEFT = -2000;
const WORLD_RIGHT = 3000;

const WORLD_WIDTH =
  WORLD_RIGHT - WORLD_LEFT;

const GROUND_Y = 660;

const PLAYER_START_X = -1500;
const PLAYER_START_Y = 600;

// =================================
// MUNDO
// =================================

const world = new Container();

app.stage.addChild(world);

// =================================
// HUD
// =================================

const healthText = new Text({
  text: '❤️ ❤️ ❤️',
  style: {
    fontSize: 28,
    fill: '#ffffff',
  },
});

healthText.x = 20;
healthText.y = 20;

app.stage.addChild(healthText);

// =================================
// CHÃO
// =================================

const ground = new Graphics();

ground.rect(
  0,
  0,
  WORLD_WIDTH,
  300
);

ground.fill('#5c4033');

ground.x = WORLD_LEFT;
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

  platform.rect(
    0,
    0,
    width,
    height
  );

  platform.fill('#33cf04');

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

player.x = PLAYER_START_X;
player.y = PLAYER_START_Y;

world.addChild(player);

// =================================
// HUD - VIDA
// =================================

function updateHealthUI() {

  let hearts = '';

  for (
    let i = 0;
    i < player.maxHealth;
    i++
  ) {

    if (i < player.health) {
      hearts += '❤️ ';
    } else {
      hearts += '🖤 ';
    }
  }

  healthText.text = hearts;
}

updateHealthUI();

// =================================
// INIMIGO
// =================================

const enemy = new Enemy(
  700,
  600,
  900
);

world.addChild(enemy);

// =================================
// PORTÃO
// =================================

const gate = new Graphics();

gate.rect(
  0,
  0,
  80,
  160
);

gate.fill('#333333');

gate.x = 2800;
gate.y = 500;

world.addChild(gate);

// =================================
// CONTROLES
// =================================

const keys: Record<string, boolean> = {};

window.addEventListener(
  'keydown',
  (event) => {
    keys[event.key.toLowerCase()] = true;
  }
);

window.addEventListener(
  'keyup',
  (event) => {
    keys[event.key.toLowerCase()] = false;
  }
);

// =================================
// COLISÃO LATERAL
// =================================

function checkHorizontalCollision(
  player: Player,
  platform: Graphics,
  previousX: number
): boolean {

  const playerTop =
    player.y;

  const playerBottom =
    player.y + player.height;

  const platformTop =
    platform.y;

  const platformBottom =
    platform.y + platform.height;

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

  const hitLeft =
    previousX + player.width <= platformLeft &&
    playerRight >= platformLeft;

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
    player.x <
      platform.x + platform.width;

  const wasAbove =
    previousY + player.height <=
    platformTop;

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
// COLISÃO COM INIMIGO
// =================================

function checkEnemyCollision(
  player: Player,
  enemy: Enemy
): boolean {

  const horizontalCollision =
    player.x + player.width > enemy.x &&
    player.x <
      enemy.x + enemy.width;

  const verticalCollision =
    player.y + player.height > enemy.y &&
    player.y <
      enemy.y + enemy.height;

  return (
    horizontalCollision &&
    verticalCollision
  );
}

// =================================
// GAME LOOP
// =================================

app.ticker.add(() => {

  // Guarda posição anterior
  const previousX = player.x;
  const previousY = player.y;

  // =================================
  // MOVIMENTO DO PLAYER
  // =================================

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

      // Player vindo pela esquerda
      if (
        previousX + player.width <=
        platform.x
      ) {

        player.x =
          platform.x -
          player.width;
      }

      // Player vindo pela direita
      else if (
        previousX >=
        platform.x +
        platform.width
      ) {

        player.x =
          platform.x +
          platform.width;
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
    player.y + player.height >=
    GROUND_Y
  ) {

    player.y =
      GROUND_Y -
      player.height;

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
        platform.y -
        player.height;

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
  // INIMIGO
  // =================================

  enemy.update();

  // =================================
  // DANO DO INIMIGO
  // =================================

  if (
    checkEnemyCollision(
      player,
      enemy
    )
  ) {

    player.takeDamage(1);

    updateHealthUI();

    console.log(
      `Vida: ${player.health}/${player.maxHealth}`
    );
  }

  // =================================
  // MORTE DO PLAYER
  // =================================

  if (
    player.health <= 0
  ) {

    player.x =
      PLAYER_START_X;

    player.y =
      PLAYER_START_Y;

    player.velocityY = 0;

    player.health =
      player.maxHealth;

    updateHealthUI();
  }

  // =================================
  // LIMITES DO MAPA
  // =================================

  if (
    player.x < WORLD_LEFT
  ) {

    player.x =
      WORLD_LEFT;
  }

  if (
    player.x + player.width >
    WORLD_RIGHT
  ) {

    player.x =
      WORLD_RIGHT -
      player.width;
  }

  // =================================
  // CÂMERA
  // =================================

  const screenCenter =
    app.screen.width / 2;

  let cameraX =
    screenCenter -
    player.x;

  // Limite esquerdo da câmera
  const minCameraX =
    app.screen.width -
    WORLD_RIGHT;

  // Limite direito da câmera
  const maxCameraX =
    -WORLD_LEFT;

  cameraX =
    Math.min(
      maxCameraX,
      Math.max(
        minCameraX,
        cameraX
      )
    );

  world.x =
    cameraX;
});