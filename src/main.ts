import {
  Application,
  Container,
  Graphics,
  Assets,
  AnimatedSprite,
  Spritesheet
} from 'pixi.js';

import { Player } from './Player';
import { Enemy } from './Enemy';

const app = new Application();

// =================================
// PIXI
// =================================

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

// =================================
// MUNDO
// =================================

const world = new Container();

app.stage.addChild(world);

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

player.x = -700;
player.y = 600;

world.addChild(player);

// Esconde apenas o desenho
// vermelho do Player.
// A física continua funcionando.

player.visible = false;

// =================================
// ALICIA
// =================================

let alicia: AnimatedSprite | null = null;

try {

  const sheet =
    await Assets.load<Spritesheet>({
      alias: 'aliciaIdle',
      src: '/assets/player/alicia-idle.json'
    });

  console.log(
    'Spritesheet da Alicia:',
    sheet
  );

  // =================================
  // PEGA OS 22 FRAMES
  // =================================

  const textures = [];

  for (
    let i = 1;
    i <= 22;
    i++
  ) {

    const frameName =
      `idle_${String(i).padStart(2, '0')}.png`;

    const texture =
      sheet.textures[frameName];

    if (!texture) {

      console.error(
        `Frame não encontrado: ${frameName}`
      );

      continue;
    }

    textures.push(texture);

  }

  console.log(
    'Frames encontrados:',
    textures.length
  );

  // =================================
  // CRIA ANIMAÇÃO
  // =================================

  if (textures.length > 0) {

    alicia =
      new AnimatedSprite(textures);

    alicia.animationSpeed =
      0.40;

    alicia.loop = true;

    // Tamanho temporário maior
    // para confirmar que está aparecendo.

    alicia.width = 228;
    alicia.height = 228;

    // Ponto de origem nos pés

    alicia.anchor.set(
      0.5,
      1
    );

    // Adiciona ao mundo

    world.addChild(alicia);

    // Começa animação

    alicia.play();

    console.log(
      'Alicia criada com sucesso!'
    );

  }

}
catch (error) {

  console.error(
    'ERRO AO CARREGAR ALICIA:',
    error
  );

}

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

    keys[
      event.key.toLowerCase()
    ] = true;

  }
);

window.addEventListener(
  'keyup',
  (event) => {

    keys[
      event.key.toLowerCase()
    ] = false;

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
    player.y +
    player.height;

  const platformTop =
    platform.y;

  const platformBottom =
    platform.y +
    platform.height;

  const verticalCollision =
    playerBottom > platformTop &&
    playerTop < platformBottom;

  const playerRight =
    player.x +
    player.width;

  const playerLeft =
    player.x;

  const platformRight =
    platform.x +
    platform.width;

  const platformLeft =
    platform.x;

  const hitLeft =
    previousX +
      player.width <=
    platformLeft &&
    playerRight >=
    platformLeft;

  const hitRight =
    previousX >=
    platformRight &&
    playerLeft <=
    platformRight;

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
    player.y +
    player.height;

  const platformTop =
    platform.y;

  const horizontalCollision =
    player.x +
      player.width >
    platform.x &&
    player.x <
      platform.x +
      platform.width;

  const wasAbove =
    previousY +
      player.height <=
    platformTop;

  const crossedPlatform =
    playerBottom >=
    platformTop;

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
    player.x +
      player.width >
    enemy.x &&
    player.x <
      enemy.x +
      enemy.width;

  const verticalCollision =
    player.y +
      player.height >
    enemy.y &&
    player.y <
      enemy.y +
      enemy.height;

  return (
    horizontalCollision &&
    verticalCollision
  );
}

// =================================
// GAME LOOP
// =================================

app.ticker.add(() => {

  const previousX =
    player.x;

  const previousY =
    player.y;

  // =================================
  // MOVIMENTO
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

  for (
    const platform of platforms
  ) {

    if (
      checkHorizontalCollision(
        player,
        platform,
        previousX
      )
    ) {

      if (
        previousX +
          player.width <=
        platform.x
      ) {

        player.x =
          platform.x -
          player.width;

      }

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
    player.y +
      player.height >=
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

  for (
    const platform of platforms
  ) {

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
  // DANO
  // =================================

  if (
    checkEnemyCollision(
      player,
      enemy
    )
  ) {

    player.takeDamage(1);

    console.log(
      `Vida: ${player.health}/${player.maxHealth}`
    );

  }

  // =================================
  // LIMITES
  // =================================

  if (
    player.x <
    WORLD_LEFT
  ) {

    player.x =
      WORLD_LEFT;

  }

  if (
    player.x +
      player.width >
    WORLD_RIGHT
  ) {

    player.x =
      WORLD_RIGHT -
      player.width;

  }

  // =================================
  // ALICIA SEGUE O PLAYER
  // =================================

  if (alicia) {

    alicia.x =
      player.x +
      player.width / 2;

    alicia.y =
      player.y +
      player.height;

  }
  

  // =================================
  // CÂMERA
  // =================================

  const screenCenter =
    app.screen.width / 2;

  let cameraX =
    screenCenter -
    player.x;

  const minCameraX =
    app.screen.width -
    WORLD_RIGHT;

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