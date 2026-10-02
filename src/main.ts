import {
  Application,
  Container,
  Graphics,
  Assets,
  AnimatedSprite,
  Spritesheet,
  Texture,
  Rectangle,
  Sprite
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
// CONFIGURAÇÕES DO MAPA
// =================================

// Cada parte do mapa tem 2048px de largura.
// Duas partes formam um mundo contínuo de 4096px.
const ROAD_WIDTH = 3240;

const WORLD_LEFT = 0;
const WORLD_RIGHT = ROAD_WIDTH * 2;

const WORLD_WIDTH =
  WORLD_RIGHT - WORLD_LEFT;

const GROUND_Y = 680;

// =================================
// CAMADAS
// =================================

const backgroundLayer = new Container();
const cityLayer = new Container();
const world = new Container();

app.stage.addChild(backgroundLayer);
app.stage.addChild(cityLayer);
app.stage.addChild(world);

// =================================
// MAPA - FUNDO
// =================================

const backgroundTexture =
  await Assets.load<Texture>(
    '/assets/map/background.png'
  );

const backgroundTexture2 =
  await Assets.load<Texture>(
    '/assets/map/background-2.png'
  );

const background =
  new Sprite(backgroundTexture);

const background2 =
  new Sprite(backgroundTexture2);

// Parte 1
background.x = 0;
background.y = 0;

// Parte 2
background2.x = 4492;
background2.y = 0;

backgroundLayer.addChild(background);
backgroundLayer.addChild(background2);


// =================================
// MAPA - CIDADE
// =================================

const cityTexture =
  await Assets.load<Texture>(
    '/assets/map/city.png'
  );

const cityTexture2 =
  await Assets.load<Texture>(
    '/assets/map/city-2.png'
  );

const city =
  new Sprite(cityTexture);

const city2 =
  new Sprite(cityTexture2);

// Parte 1
city.x = 0;
city.y = 0;

// Parte 2
city2.x = 4492;
city2.y = 0;

cityLayer.addChild(city);
cityLayer.addChild(city2);

// =================================
// MAPA - PISTA
// =================================

const roadTexture =
  await Assets.load<Texture>(
    '/assets/map/road.png'
  );

const roadTexture2 =
  await Assets.load<Texture>(
    '/assets/map/road-2.png'
  );

const road =
  new Sprite(roadTexture);

const road2 =
  new Sprite(roadTexture2);

// Parte 1
road.x = 0;
road.y = 0;

// Parte 2
road2.x = ROAD_WIDTH;
road2.y = 0;

// As duas pistas têm exatamente
// 3240 × 1080.
// Não redimensionar.
world.addChild(road);
world.addChild(road2);

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
  createPlatform(1650, 430, 200, 30),
];

// =================================
// PLAYER
// =================================

const player = new Player();

player.x = 250;
player.y = GROUND_Y - player.height;

// Player é apenas a hitbox.
// A Olivia será desenhada por cima.
player.visible = false;

world.addChild(player);

// =================================
// OLIVIA
// =================================

let olivia: AnimatedSprite | null = null;

const oliviaIdleTextures: Texture[] = [];
const oliviaIdleLeftTextures: Texture[] = [];
const oliviaWalkTextures: Texture[] = [];
const oliviaJumpTextures: Texture[] = [];

let oliviaAnimation:
  | 'idle'
  | 'walk'
  | 'jump' = 'idle';

// =================================
// CARREGAR OLIVIA
// =================================

try {

  // =================================
  // JUMP - JSON
  // =================================

  try {
    const jumpSheet = await Assets.load<Spritesheet>({
      alias: 'oliviaJump',
      src: '/assets/player/olivia-jump.json'
    });

    for (let i = 1; i <= 8; i++) {
      const frameName =
        `jump_${String(i).padStart(2, '0')}.png`;

      const texture =
        jumpSheet.textures[frameName];

      if (!texture) {
        console.error(
          'Frame Jump não encontrado:',
          frameName
        );
        continue;
      }

      oliviaJumpTextures.push(texture);
    }

  } catch (error) {
    console.warn(
      'Jump JSON indisponível, seguindo para jump-2:',
      error
    );
  }

  // =================================
  // IDLE
  // =================================

  const idleSheet =
    await Assets.load<Spritesheet>({
      alias: 'oliviaIdle',
      src: '/assets/player/olivia-idle.json'
    });

  console.log(
    'Idle carregado:',
    idleSheet
  );

  for (let i = 1; i <= 22; i++) {

    const frameName =
      `idle_${String(i).padStart(2, '0')}.png`;

    const texture =
      idleSheet.textures[frameName];

    if (!texture) {
      console.error(
        'Frame Idle não encontrado:',
        frameName
      );
      continue;
    }

    oliviaIdleTextures.push(texture);
  }

  console.log(
    'Frames Idle:',
    oliviaIdleTextures.length
  );

  // =================================
  // WALK
  // =================================

  const walkSheet =
    await Assets.load<Spritesheet>({
      alias: 'oliviaWalk',
      src: '/assets/player/olivia-walk.json'
    });

  console.log(
    'Walk carregado:',
    walkSheet
  );

  for (let i = 1; i <= 23; i++) {

    const frameName =
      `walk_${String(i).padStart(2, '0')}.png`;

    const texture =
      walkSheet.textures[frameName];

    if (!texture) {
      console.error(
        'Frame Walk não encontrado:',
        frameName
      );
      continue;
    }

    oliviaWalkTextures.push(texture);
  }

  console.log(
    'Frames Walk:',
    oliviaWalkTextures.length
  );

  // =================================
  // JUMP-2
  // =================================

  if (oliviaJumpTextures.length === 0) {

    try {

      const jumpBase =
        await Assets.load<Texture>(
          '/assets/player/olivia-jump-2.png'
        );

      // Células de 200x200.
      // O spritesheet atual usa 5 frames.
      const jumpFrames = [
        [0, 4],
        [200, 4],
        [400, 4],
        [600, 4],
        [800, 4],
      ];

      for (const [x, y] of jumpFrames) {

        oliviaJumpTextures.push(
          new Texture({
            source: jumpBase.source,
            frame: new Rectangle(
              x,
              y,
              200,
              200
            )
          })
        );

      }

      console.log(
        'Frames Jump:',
        oliviaJumpTextures.length
      );

    } catch (error) {

      console.warn(
        'Jump indisponível:',
        error
      );

    }
  }

  // =================================
  // CRIAR OLIVIA
  // =================================

  if (
    oliviaIdleTextures.length > 0 &&
    oliviaWalkTextures.length > 0
  ) {

    olivia =
      new AnimatedSprite(
        oliviaIdleTextures
      );

    olivia.animationSpeed = 0.5;
    olivia.loop = true;

    // Cada frame visual ocupa 200x200.
    olivia.width = 200;
    olivia.height = 200;

    // Centro horizontal.
    // Os pés ficam exatamente no player.
    olivia.anchor.set(
      0.5,
      1
    );

    world.addChild(olivia);

    olivia.play();

    console.log(
      'Olivia criada com sucesso!'
    );

  } else {

    console.error(
      'Não foi possível criar a Olivia.'
    );

  }

} catch (error) {

  console.error(
    'ERRO AO CARREGAR OLIVIA:',
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

gate.x = 3900;
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
    previousX + player.width <=
      platformLeft &&
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
    player.x + player.width >
      platform.x &&
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
    player.x + player.width >
      enemy.x &&
    player.x <
      enemy.x + enemy.width;

  const verticalCollision =
    player.y + player.height >
      enemy.y &&
    player.y <
      enemy.y + enemy.height;

  return (
    horizontalCollision &&
    verticalCollision
  );
}

// =================================
// CÂMERA
// =================================

function updateCamera() {

  const screenCenter =
    app.screen.width / 2;

  let cameraX =
    screenCenter -
    player.x -
    player.width / 2;

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

  // Pista, player e objetos.
  world.x = cameraX;

  // Parallax:
  // cidade anda mais devagar que a pista.
  city.x = cameraX * 0.5;

  // Fundo anda ainda mais devagar.
  background.x = cameraX * 0.2;
}

// =================================
// GAME LOOP
// =================================

app.ticker.add(() => {

  // =================================
  // POSIÇÃO ANTERIOR
  // =================================

  const previousX =
    player.x;

  const previousY =
    player.y;

  // =================================
  // MOVIMENTO
  // =================================

  const movingLeft =
    keys['a'] ||
    keys['arrowleft'];

  const movingRight =
    keys['d'] ||
    keys['arrowright'];

  if (movingLeft) {
    player.moveLeft();
  }

  if (movingRight) {
    player.moveRight();
  }

  // =================================
  // ANIMAÇÃO DA OLIVIA
  // =================================

  if (olivia) {

    const isMoving =
      movingLeft ||
      movingRight;

    const isJumping =
      !player.onGround;

    let desired:
      'idle' |
      'walk' |
      'jump' = 'idle';

    if (
      isJumping &&
      oliviaJumpTextures.length > 0
    ) {

      desired = 'jump';

    } else if (isMoving) {

      desired = 'walk';

    }

    if (
      desired !== oliviaAnimation
    ) {

      oliviaAnimation =
        desired;

      if (
        desired === 'jump'
      ) {

        olivia.textures =
          oliviaJumpTextures;

        olivia.animationSpeed =
          0.3;

        olivia.loop =
          false;

      } else if (
        desired === 'walk'
      ) {

        olivia.textures =
          oliviaWalkTextures;

        olivia.animationSpeed =
          0.5;

        olivia.loop =
          true;

      } else {

        olivia.textures =
          oliviaIdleTextures;

        olivia.animationSpeed =
          0.15;

        olivia.loop =
          true;
      }

      olivia.gotoAndPlay(0);
    }

    // Direção
    if (movingLeft) {
      olivia.scale.x =
        -Math.abs(
          olivia.scale.x
        );
    }

    if (movingRight) {
      olivia.scale.x =
        Math.abs(
          olivia.scale.x
        );
    }
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

      // Player vindo pela esquerda
      if (
        previousX +
          player.width <=
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

  player.onGround =
    false;

  // =================================
  // CHÃO DA PISTA
  // =================================

  if (
    player.y +
      player.height >=
    GROUND_Y
  ) {

    player.y =
      GROUND_Y -
      player.height;

    player.velocityY =
      0;

    player.onGround =
      true;
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

      player.velocityY =
        0;

      player.onGround =
        true;
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
  // LIMITES DO MAPA
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
  // OLIVIA SEGUE O PLAYER
  // =================================

  if (olivia) {

    olivia.x =
      player.x +
      player.width / 2;

    olivia.y =
      player.y +
      player.height -
      5;
  }

  // =================================
  // CÂMERA
  // =================================

  updateCamera();

});
