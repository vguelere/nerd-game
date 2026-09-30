# 🎮 Nerd Game

Um jogo 2D desenvolvido com **TypeScript + PixiJS**, criado como projeto autoral para explorar desenvolvimento de jogos, animação por spritesheet, programação orientada a objetos e construção de interfaces interativas.

O projeto acompanha **Alicia**, uma personagem que pode se movimentar pelo cenário, executar animações e enfrentar inimigos em uma experiência inspirada nos clássicos jogos 2D.

---

## 🕹️ Sobre o projeto

**Nerd Game** é um projeto experimental e autoral desenvolvido para colocar em prática conceitos de desenvolvimento de jogos utilizando tecnologias web.

O foco principal do projeto está na criação de:

* 🎮 Sistema de movimentação do personagem
* 🧍 Personagem jogável
* 🚶 Animações de movimento
* 🦘 Animação de pulo
* ⚔️ Sistema preparado para ações de combate
* 👾 Sistema de inimigos
* ❤️ Barra de vida
* 🎨 Cenários e elementos gráficos
* 🧩 Spritesheets e animações em frames
* 🏗️ Organização do código em componentes/classes

---

## ✨ Tecnologias

| Tecnologia     | Utilização             |
| -------------- | ---------------------- |
| **TypeScript** | Linguagem principal    |
| **PixiJS**     | Engine/renderização 2D |
| **JavaScript** | Base da aplicação      |
| **HTML5**      | Estrutura da aplicação |
| **CSS**        | Estilização            |
| **Git**        | Controle de versão     |
| **GitHub**     | Hospedagem do código   |

---

## 📁 Estrutura do projeto

```text
nerd-game/
│
├── assets/
│   ├── player/
│   │   ├── alicia-idle.json
│   │   ├── alicia-idle.png
│   │   ├── alicia-walk.json
│   │   ├── alicia-walk.png
│   │   ├── alicia-jump.json
│   │   └── alicia-jump.png
│   │
│   └── ...
│
├── src/
│   ├── Player.ts
│   ├── Enemy.ts
│   └── main.ts
│
├── index.html
├── package.json
├── tsconfig.json
└── README.md
```

A estrutura pode evoluir conforme novas mecânicas e sistemas forem adicionados ao jogo.

---

## 🧍 Personagem

A personagem principal é **Alicia**.

O sistema de animação utiliza spritesheets, permitindo que cada estado do personagem seja composto por vários frames.

### Estados atuais

* **Idle** — personagem parada
* **Walk** — personagem caminhando
* **Jump** — personagem pulando

Cada animação é organizada através de arquivos `.png` e `.json`, permitindo que o PixiJS carregue e reproduza os frames individualmente.

Exemplo:

```text
alicia-idle.png
alicia-idle.json

alicia-walk.png
alicia-walk.json

alicia-jump.png
alicia-jump.json
```

---

## 🎞️ Sistema de animação

As animações são carregadas através do sistema de `Assets` e `Spritesheet` do PixiJS.

Exemplo:

```typescript
const idleSheet = await Assets.load<Spritesheet>({
  alias: 'aliciaIdle',
  src: '/assets/player/alicia-idle.json'
});
```

Os frames são então utilizados para construir as animações do personagem.

Isso permite separar os diferentes estados da personagem e controlar quando cada animação deve ser executada.

---

## 🎮 Controles

Os controles atuais do jogo utilizam o teclado.

| Tecla     | Ação                |
| --------- | ------------------- |
| `A` / `←` | Mover para esquerda |
| `D` / `→` | Mover para direita  |
| `Espaço`  | Pular               |

Os controles podem ser ampliados conforme novas mecânicas forem implementadas.

---

## 👾 Inimigos

O projeto também possui uma estrutura dedicada aos inimigos.

A lógica é separada da classe principal do jogador, permitindo que diferentes tipos de inimigos sejam adicionados futuramente.

Exemplo de organização:

```typescript
import { Enemy } from './Enemy';
```

A arquitetura foi pensada para permitir a evolução do sistema para diferentes comportamentos, ataques e interações.

---

## ❤️ Sistema de vida

O jogo possui uma interface de vida do personagem.

A HUD pode ser atualizada conforme o estado do jogador muda, permitindo futuramente implementar:

* Dano
* Cura
* Game Over
* Sistema de vidas
* Indicadores de inimigos
* Status do jogador

---

## 🏗️ Arquitetura

O projeto busca manter responsabilidades separadas entre os diferentes elementos do jogo.

### `main.ts`

Responsável principalmente pela inicialização do jogo e configuração do ambiente PixiJS.

```text
main.ts
   │
   ├── Inicialização do PixiJS
   ├── Carregamento dos assets
   ├── Criação do cenário
   ├── Criação do Player
   └── Criação dos Enemy
```

### `Player.ts`

Responsável pelo comportamento do personagem:

```text
Player
 ├── Movimento
 ├── Animações
 ├── Pulo
 ├── Direção
 └── Estado do personagem
```

### `Enemy.ts`

Responsável pela lógica dos inimigos:

```text
Enemy
 ├── Posição
 ├── Movimento
 ├── Estado
 └── Interação com o jogador
```

---

## 🚀 Como executar

Clone o repositório:

```bash
git clone https://github.com/vguelere/nerd-game.git
```

Entre na pasta:

```bash
cd nerd-game
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

Depois, abra o endereço informado pelo Vite no navegador.

---

## 🔧 Desenvolvimento

Durante o desenvolvimento, o projeto utiliza:

```bash
npm run dev
```

Para verificar o código TypeScript:

```bash
npx tsc --noEmit
```

---

## 🎯 Objetivos do projeto

O Nerd Game também funciona como um laboratório de aprendizado e desenvolvimento.

Entre os principais objetivos estão:

* Aprender desenvolvimento de jogos 2D
* Aprofundar conhecimentos em TypeScript
* Trabalhar com PixiJS
* Desenvolver sistemas de animação
* Trabalhar com spritesheets
* Praticar orientação a objetos
* Criar sistemas de colisão
* Desenvolver inteligência básica para inimigos
* Trabalhar com HUDs
* Organizar um projeto de software
* Utilizar Git e GitHub durante o desenvolvimento

---

## 🛣️ Roadmap

### ✅ Implementado

* [x] Estrutura inicial do jogo
* [x] PixiJS
* [x] TypeScript
* [x] Personagem Alicia
* [x] Sistema de Player
* [x] Animação Idle
* [x] Animação Walk
* [x] Ani
