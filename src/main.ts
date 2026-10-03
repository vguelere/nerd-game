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
const ROAD_WIDTH = 3040;

const WORLD_LEFT = 0;
const WORLD_RIGHT = ROAD_WIDTH * 2;

const WORLD_WIDTH =
  WORLD_RIGHT - WORLD_LEFT;

const GROUND_Y = 680;

// =================================
// CAMADAS
// =================================

const backgroundLayer = new Container();
const waterLayer = new Container();
const cityLayer = new Container();
const world = new Container();
const smokeLayer = new Container();


app.stage.addChild(backgroundLayer);
app.stage.addChild(cityLayer);
app.stage.addChild(waterLayer);
app.stage.addChild(smokeLayer);
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
// SMOKE
// =================================

const smokeSheet =
  await Assets.load<Spritesheet>({
    alias: 'smoke',
    src: '/assets/effects/smoke.json'
  });
  

const smokeTextures = [
  smokeSheet.textures['smoke_01.png'],
  smokeSheet.textures['smoke_02.png'],
  smokeSheet.textures['smoke_03.png'],
  smokeSheet.textures['smoke_04.png'],
];

const smokeSprite = new AnimatedSprite(
  smokeTextures
);

smokeSprite.animationSpeed = 0.1;
smokeSprite.loop = true;
smokeSprite.scale.set(0.5);
smokeSprite.x = 2000;
smokeSprite.y = 250;

smokeSprite.play();

smokeLayer.addChild(smokeSprite);

for (let i = 0; i < 14; i++) {

  const smoke = new AnimatedSprite(smokeTextures);

  smoke.animationSpeed = 0.1;
  smoke.loop = true;

  smoke.scale.set(0.5);

  smoke.x = i * 600; // ← aumenta o espaçamento
  smoke.y = 200;

  smoke.gotoAndPlay(i % smokeTextures.length);

  smokeLayer.addChild(smoke);
}


//
// AGUA
//

const waterTexture = await Assets.load<Texture>(
  '/assets/effects/water.png'
);

const waterTextures: Texture[] = [];

const FRAME_WIDTH = 400;
const FRAME_HEIGHT = 480;

for (let i = 0; i < 5; i++) {

  waterTextures.push(
    new Texture({
      source: waterTexture.source,
      frame: new Rectangle(
        i * FRAME_WIDTH,
        0,
        FRAME_WIDTH,
        FRAME_HEIGHT
      )
    })
  );
}

const waterSprite = new AnimatedSprite(waterTextures);

waterSprite.animationSpeed = 16 / 60;
waterSprite.loop = true;

waterSprite.x = 0;
waterSprite.y = 480;

waterSprite.play();

waterLayer.addChild(waterSprite);


for (let i = 0; i < 14; i++) {

  const water = new AnimatedSprite(waterTextures);

  water.animationSpeed = 4 / 60;
  water.loop = true;

  water.x = i * 400;
  water.y = 580;

  // Pequena diferença para não ficarem todas sincronizadas
  water.gotoAndPlay(i % waterTextures.length);

  waterLayer.addChild(water);
}

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
city.y = -120;

// Parte 2
city2.x = 4492;
city2.y = 0;

cityLayer.addChild(city);
cityLayer.addChild(city2);

// =================================
// MAPA - PISTA
// =================================

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

console.log(
  'ROAD 1:',
  roadTexture.width,
  roadTexture.height
);

console.log(
  'ROAD 2:',
  roadTexture2.width,
  roadTexture2.height
);

const road = new Sprite(
  roadTexture
);

road.x = 0;
road.y = 0;

const road2 = new Sprite(
  roadTexture2
);

road2.x = 3240;

// Alinha a parte inferior da segunda pista
// exatamente com o chão do jogo.
road2.y = 40;

world.addChild(road);
world.addChild(road2);

console.log(
  'ROAD 2 POSIÇÃO:',
  road2.x,
  road2.y
);

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

const oliviaAnimations: Record<
  'idle' | 'walk' | 'jump' | 'attack',
  Texture[]
> = {
  idle: [],
  walk: [],
  jump: [],
  attack: []
};

let oliviaAnimation:
  | 'idle'
  | 'walk'
  | 'jump'
  | 'attack' = 'idle';

let oliviaAttackTimer = 0;
let oliviaFacing = 1;

// =================================
// CARREGAR OLIVIA
// =================================

try {

  const oliviaBase =
    await Assets.load<Texture>(
      '/assets/player/olivia/spritesheet.png'
    );

  const FRAME_WIDTH = 200;
  const FRAME_HEIGHT = 200;

  const animationRows = {
    idle: 0,
    walk: 1,
    jump: 2,
    attack: 3
  } as const;

  for (const [name, row] of Object.entries(animationRows)) {

    const key =
      name as keyof typeof animationRows;

    for (let i = 0; i < 4; i++) {

      oliviaAnimations[key].push(
        new Texture({
          source: oliviaBase.source,
          frame: new Rectangle(
            i * FRAME_WIDTH,
            row * FRAME_HEIGHT,
            FRAME_WIDTH,
            FRAME_HEIGHT
          )
        })
      );
    }
  }

  olivia =
    new AnimatedSprite(
      oliviaAnimations.idle
    );

  olivia.width = 200;
  olivia.height = 200;

  // O ponto de origem fica nos pés.
  olivia.anchor.set(0.5, 1);

  olivia.animationSpeed = 4 / 60;
  olivia.loop = true;

  world.addChild(olivia);

  olivia.play();

  console.log(
    'Olivia criada com sucesso!'
  );

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

//
// ataque com o teclado
//

let mouseAttack = false;

window.addEventListener('mousedown', (event) => {

  if (event.button === 0) {
    mouseAttack = true;
  }

});

window.addEventListener('mouseup', (event) => {

  if (event.button === 0) {
    mouseAttack = false;
  }

});


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

  // smoke
  smokeLayer.x = cameraX * 0.7;

  //water
  waterLayer.x = cameraX * 0.5;

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

      const attackPressed = mouseAttack;

    // Ataque: J ou X.
    if (
      attackPressed &&
      oliviaAnimation !== 'attack'
    ) {

      oliviaAnimation = 'attack';

      olivia.textures =
        oliviaAnimations.attack;

      olivia.animationSpeed =
        10 / 60;

      olivia.loop = false;
      olivia.gotoAndPlay(0);

      oliviaAttackTimer = 6;
    }

    if (
      oliviaAnimation === 'attack'
    ) {

      oliviaAttackTimer--;

      if (
        oliviaAttackTimer <= 0 &&
        !olivia.playing
      ) {

        oliviaAnimation =
          player.onGround
            ? (isMoving ? 'walk' : 'idle')
            : 'jump';

        olivia.textures =
          oliviaAnimations[
            oliviaAnimation
          ];

        olivia.animationSpeed =
          oliviaAnimation === 'jump'
            ? 8 / 60
            : 4 / 60;

        olivia.loop =
          oliviaAnimation !== 'jump';

        olivia.gotoAndPlay(0);
      }

    } else {

      const isJumping =
        !player.onGround;

      let desired:
        'idle' |
        'walk' |
        'jump' = 'idle';

      if (isJumping) {

        desired = 'jump';

      } else if (isMoving) {

        desired = 'walk';
      }

      if (
        desired !== oliviaAnimation
      ) {

        oliviaAnimation =
          desired;

        olivia.textures =
          oliviaAnimations[
            desired
          ];

        olivia.animationSpeed =
          desired === 'jump'
            ? 8 / 60
            : 4 / 60;

        olivia.loop =
          desired !== 'jump';

        olivia.gotoAndPlay(0);
      }
    }

    // Direção.
    if (movingLeft) {

      oliviaFacing = -1;

    } else if (movingRight) {

      oliviaFacing = 1;
    }

    olivia.scale.x =
      Math.abs(
        olivia.scale.x
      ) * oliviaFacing;
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
      player.height;
  }

  // =================================
  // CÂMERA
  // =================================

  updateCamera();

});
