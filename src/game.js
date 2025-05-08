class Base {
  copy() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

class Card extends Base {
  constructor(
    id,
    name,
    image,
    background,
    description,
    cardEffect,
    singleTarget,
    noTarget
  ) {
    super();
    this.id = id;
    this.name = name;
    this.image = image;
    this.background = background;
    this.description = description;
    this.cardEffect = cardEffect;
    this.singleTarget = singleTarget;
    this.noTarget = noTarget;
  }
}

class CardEffect {
  constructor(...events) {
    this.events = events || [];
  }
}

class CardEvent {
  constructor(eventType, value1, value2, value3) {
    this.eventType = eventType;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }
}

class Entity extends Base {
  constructor(maxHp) {
    super();

    this.maxHp = maxHp;
    this.hp = this.maxHp;
    this.turnIndex = -1;

    this.shield = 0;
  }

  modifyHp(value) {
    // this.hp = Math.max(0, this.hp + value);
    this.hp += value;

    if (this.hp <= 0) {
      this.die();
    }
  }

  startTurn() {
    this.turnIndex++;

    this.shield = 0;
  }

  die() {
    combat.enemies.splice(combat.enemies.indexOf(this), 1);
  }
}

class Enemy extends Entity {
  constructor(id, name, image, background, maxHp) {
    super(maxHp);

    this.id = id;
    this.name = name;
    this.image = image;
    this.background = background;
  }

  startTurn() {
    super.startTurn();
    this.endTurn();
  }

  endTurn() {
    combat.endTurn();
  }
}

class Player extends Entity {
  constructor(maxHp) {
    super(maxHp);

    this.hand = [];
    this.deck = [];
    this.discardPile = [];

    this.energy = 0;
    this.turnEnergy = 3;

    this.shield = 0;
  }

  draw(amount) {
    let i = 0;
    while (i < amount) {
      if (this.deck.length === 0) {
        if (this.discardPile.length === 0) {
          break;
        }

        this.deck.push(...this.discardPile);
        this.discardPile.length = 0;
        shuffle(this.deck);
      }
      this.hand.push(this.deck.pop());
      i++;
    }
  }

  startTurn() {
    super.startTurn();

    this.energy = this.turnEnergy;
    this.draw(5);

    endTurnButton.disabled = false;

    combat.newEnemyTimer.current++;
    if (combat.newEnemyTimer.current >= combat.newEnemyTimer.peak) {
      combat.newEnemyTimer.current = 0;
      combat.generateEnemy(1);
    }

    updateDisplay();
  }

  endTurn() {
    this.discardPile.push(...this.hand);
    this.hand.length = 0;

    endTurnButton.disabled = true;
    combat.endTurn();
  }

  cardInteraction(card, card_index_in_hand, targets) {
    if (this.energy <= 0 || (card.singleTarget && targets.length > 1)) {
      return;
    }
    this.energy--;

    if (card.noTarget && targets.length > 0) {
      targets.length == 0;
    }

    const cardEffect = card.cardEffect;

    cardEffect.events.forEach((event) => {
      const eventType = event.eventType;
      const value1 = event.value1;
      const value2 = event.value2;
      const value3 = event.value3;

      if (eventType == "damage") {
        targets.forEach((target) => {
          const repeats = value2 || 1;
          for (let i = 0; i < repeats; i++) {
            target.modifyHp(-value1);
          }
        });
      } else if (eventType == "shield") {
        this.shield += value1;
      }
    });

    if (cardEffect.selfShieldAmount) {
      this.shield += cardEffect.selfShieldAmount;
    }

    let c = Object.assign({}, this.hand[card_index_in_hand]);
    this.hand.splice(card_index_in_hand, 1);
    this.discardPile.push(c);

    updateDisplay();
  }

  addCard(card, amount) {
    let x = 0;

    while (x < amount) {
      card = card.copy();
      this.discardPile.push(card);
      x++;
    }
  }
}

class Combat {
  constructor() {
    this.enemies = [];

    this.turnIndex = -1;
    this.turnEntity = null;

    this.newEnemyTimer = new Timer(5);

    this.enemyHpMultModifier = 1.05;
    this.enemyHpMultTurns = 5;
  }

  addEnemy(enemy) {
    enemy = enemy.copy();

    enemy.maxHp = Math.ceil(enemy.maxHp * this.getEnemyHpMult());
    enemy.hp = enemy.maxHp;

    this.enemies.push(enemy);
  }

  startTurn() {
    this.turnIndex++;

    if (this.enemies.length) {
      this.turnEntity = [player, ...this.enemies][
        this.turnIndex % this.enemies.length
      ];
    } else {
      this.turnEntity = player;
      this.generateEnemy(2);
      this.newEnemyTimer.current = 0;
    }

    this.turnEntity.startTurn();
  }

  endTurn() {
    this.startTurn();
  }

  generateEnemy(times) {
    let x = 0;
    const enemiesLen = Object.keys(presets.enemies).length;

    while (x < times) {
      const r = Math.floor(Math.random() * enemiesLen);
      this.addEnemy(presets.enemies[r]);
      x++;
    }
  }

  getEnemyHpMult() {
    if (player.turnIndex <= 1) {
      return 1;
    } else {
      let e = Math.floor(player.turnIndex / this.enemyHpMultTurns);
      return Math.pow(this.enemyHpMultModifier, e);
    }
  }
}

class Timer {
  constructor(peak) {
    this.current = -1;
    this.peak = peak;
  }
}

const presets = {
  cards: {
    0: new Card(
      0,
      "Debug Card 1",
      "assets/cards/0.png",
      "#fdd",
      "Deal 999 damage to a single target",
      new CardEffect(new CardEvent("damage", 999, 1)),
      true
    ),
    1: new Card(
      1,
      "Debug Card 2",
      "assets/cards/1.png",
      "#fdf",
      "Gain 5 shield",
      new CardEffect(new CardEvent("shield", 5)),
      false,
      true
    ),
    2: new Card(
      2,
      "Debug Card 3",
      "assets/cards/2.png",
      "#ddf",
      `Multiple\nrows,\nlike,\nmore\nthan\n:3`,
      new CardEffect()
    ),
  },
  enemies: {
    0: new Enemy(0, "Debug Enemy 1", "assets/enemies/0.png", "#dfd", 50),
    1: new Enemy(1, "Debug Enemy 2", "assets/enemies/1.png", "#ddf", 69),
    2: new Enemy(2, "Debug Enemy 3", "assets/enemies/2.png", "#dff", 42),
  },
};

const player = new Player(50);

player.addCard(presets.cards[0], 4);
player.addCard(presets.cards[1], 3);
player.addCard(presets.cards[2], 1);

const combat = new Combat();

combat.generateEnemy(3);

//

const hand = document.getElementById("hand");
const enemies = document.getElementById("enemies");
const endTurnButton = document.getElementById("endTurn");

let scrollAmount = 0;
let isScrolling = false;

hand.addEventListener(
  "wheel",
  function (event) {
    if (
      event.target &&
      event.target.closest &&
      event.target.closest(".cardDescription")
    )
      return;

    scrollAmount += event.deltaY;
    event.preventDefault();
    if (!isScrolling) smoothScroll(hand);
  },
  { passive: false }
);

enemies.addEventListener(
  "wheel",
  function (event) {
    scrollAmount += event.deltaY;
    event.preventDefault();
    if (!isScrolling) smoothScroll(enemies);
  },
  { passive: false }
);

function smoothScroll(object) {
  isScrolling = true;
  const step = () => {
    const delta = scrollAmount * 0.25;
    object.scrollLeft += delta;
    scrollAmount -= delta;

    if (Math.abs(scrollAmount) > 0.5) {
      requestAnimationFrame(step);
    } else {
      scrollAmount = 0;
      isScrolling = false;
    }
  };
  requestAnimationFrame(step);
}

//

let draggedCard = null;
let offsetX = 0;
let offsetY = 0;

function f(event) {
  if (event.target && event.target.closest) {
    const description = event.target.closest(".cardDescription");
    if (description) {
      const rect = description.getBoundingClientRect();
      const scrollbarWidth = description.offsetWidth - description.clientWidth;

      if (scrollbarWidth > 0) {
        const overScrollbar =
          event.clientX >= rect.right - scrollbarWidth &&
          event.clientX <= rect.right;
        if (overScrollbar) return true;
      }
    }
  } else return false;
}

function onStart(event) {
  if (player.energy <= 0 || f(event)) return;

  const isTouch = event.type === "touchstart";
  const clientX = isTouch ? event.touches[0].clientX : event.clientX;
  const clientY = isTouch ? event.touches[0].clientY : event.clientY;

  const original = event.currentTarget;
  const rect = original.getBoundingClientRect();

  draggedCard = original.cloneNode(true);
  draggedCard.style.position = "absolute";
  draggedCard.style.left = `${rect.left}px`;
  draggedCard.style.top = `${rect.top}px`;
  draggedCard.style.width = `${rect.width}px`;
  draggedCard.style.height = `${rect.height}px`;
  draggedCard.className = "card draggedCard";

  draggedCard.setAttribute(
    "data-index-in-hand",
    original.getAttribute("data-index-in-hand")
  );

  document.body.appendChild(draggedCard);

  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onEnd);
}

function onMove(event) {
  if (!draggedCard) return;

  const isTouch = event.type === "touchmove";
  const clientX = isTouch ? event.touches[0].clientX : event.clientX;
  const clientY = isTouch ? event.touches[0].clientY : event.clientY;

  draggedCard.style.left = `${clientX - offsetX}px`;
  draggedCard.style.top = `${clientY - offsetY}px`;

  if (isTouch) {
    event.preventDefault();
  }
}

function onEnd(event) {
  if (!draggedCard) return;

  const isTouch = event.type === "touchend";
  const clientX = isTouch ? event.changedTouches[0].clientX : event.clientX;
  const clientY = isTouch ? event.changedTouches[0].clientY : event.clientY;

  const indexInHand = draggedCard.getAttribute("data-index-in-hand");
  const draggedCardData = player.hand[parseInt(indexInHand)];

  const elementBelowRelease = document.elementFromPoint(clientX, clientY);

  let targetEnemy = null;
  if (elementBelowRelease.classList.contains("enemy")) {
    targetEnemy = elementBelowRelease;
  } else if (
    elementBelowRelease.classList.contains("enemyName") ||
    elementBelowRelease.classList.contains("enemyImage")
  ) {
    targetEnemy = elementBelowRelease.parentElement;
  } else if (elementBelowRelease.id == "enemies") {
    targetEnemy = "all";
  } else if (
    elementBelowRelease.id == "middle" ||
    elementBelowRelease.id == "playerStats" ||
    elementBelowRelease.id == "otherStats" ||
    elementBelowRelease.id == "playerHp" ||
    elementBelowRelease.id == "playerHpText" ||
    elementBelowRelease.id == "playerEnergy" ||
    elementBelowRelease.id == "playerEnergyText" ||
    elementBelowRelease.id == "turnCounter" ||
    elementBelowRelease.id == "newEnemyCounter"
  ) {
    targetEnemy = "none";
  }

  let targetEnemyData = [];
  if (targetEnemy && targetEnemy !== "all" && targetEnemy !== "none") {
    const enemyIndex = targetEnemy.getAttribute("data-index-in-enemies");
    targetEnemyData.push(combat.enemies[parseInt(enemyIndex)]);
  } else if (targetEnemy === "all") {
    targetEnemyData.push(...combat.enemies);
  }

  if (targetEnemyData.length > 0 || targetEnemy == "none") {
    player.cardInteraction(draggedCardData, indexInHand, targetEnemyData);
  }

  draggedCard.remove();
  draggedCard = null;

  document.removeEventListener("mousemove", onMove);
  document.removeEventListener("mouseup", onEnd);
  document.removeEventListener("touchmove", onMove);
  document.removeEventListener("touchend", onEnd);
}

//

function renderHand() {
  hand.innerHTML = "";

  player.hand.forEach((card, index) => {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.style.backgroundColor = card.background;
    cardElement.setAttribute("data-index-in-hand", index);

    const cardName = document.createElement("div");
    cardName.className = "cardName";
    cardName.innerText = card.name;

    const cardImage = document.createElement("img");
    cardImage.className = "cardImage";
    cardImage.src = card.image;
    cardImage.draggable = false;

    const cardDescription = document.createElement("div");
    cardDescription.className = "cardDescription";
    cardDescription.innerText = card.description;

    cardElement.appendChild(cardName);
    cardElement.appendChild(cardImage);
    cardElement.appendChild(cardDescription);

    cardElement.addEventListener("mousedown", onStart);
    cardElement.addEventListener("touchstart", onStart, { passive: false });

    hand.appendChild(cardElement);
  });
}

function renderEnemies() {
  enemies.innerHTML = "";

  combat.enemies.forEach((enemy, index) => {
    const enemyElement = document.createElement("div");
    enemyElement.className = "enemy";
    enemyElement.style.backgroundColor = enemy.background;
    enemyElement.setAttribute("data-index-in-enemies", index);

    const enemyName = document.createElement("div");
    enemyName.className = "enemyName";
    enemyName.innerText = enemy.name;

    const enemyImage = document.createElement("img");
    enemyImage.className = "enemyImage";
    enemyImage.src = enemy.image;
    enemyImage.draggable = false;

    const enemyHp = document.createElement("progress");
    enemyHp.className = "enemyHp";
    enemyHp.value = enemy.hp;
    enemyHp.max = enemy.maxHp;

    const hpText = document.createElement("span");
    hpText.className = "enemyHpValue";
    let percentage = Math.floor((enemy.hp / enemy.maxHp) * 100);
    if (percentage === 0 && enemy.hp > 1) {
      percentage = 1;
    }
    hpText.innerText = `${enemy.hp} / ${enemy.maxHp} (${percentage}%)`;

    enemyElement.appendChild(enemyName);
    enemyElement.appendChild(enemyImage);
    enemyElement.appendChild(enemyHp);
    enemyElement.appendChild(hpText);

    enemies.appendChild(enemyElement);
  });
}

function updateDisplay() {
  renderHand();
  renderEnemies();
  updatePlayerUi();
  updateOtherUi();
}

const playerHp = document.getElementById("playerHp");
const playerEnergy = document.getElementById("playerEnergy");
const playerHpText = document.getElementById("playerHpText");
const playerEnergyText = document.getElementById("playerEnergyText");

function updatePlayerUi() {
  playerHp.value = player.hp;
  playerHp.max = player.maxHp;

  playerHpText.textContent = `${player.hp} / ${player.maxHp} HP`;
  if (player.shield > 0) {
    playerHpText.append(` + ${player.shield}`);
  }

  playerEnergy.value = player.energy;
  playerEnergy.max = player.turnEnergy;

  playerEnergyText.textContent = `${player.energy} / ${player.turnEnergy} Energy`;
}

const turnCounter = document.getElementById("turnCounter");
const newEnemyCounter = document.getElementById("newEnemyCounter");

function updateOtherUi() {
  turnCounter.textContent = `Turn ${player.turnIndex + 1}`;
  newEnemyCounter.textContent = `New enemy spawns in ${
    combat.newEnemyTimer.peak - combat.newEnemyTimer.current
  } turns`;
}

//

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//

endTurnButton.onclick = player.endTurn.bind(player);

//

function clearCacheAndReload() {
  if ("caches" in window) {
    caches
      .keys()
      .then(function (names) {
        for (let name of names) {
          caches.delete(name);
        }
      })
      .then(function () {
        window.location.reload(true);
      });
  } else {
    window.location.reload(true);
  }
}

function handleKeyRelease(event) {
  if (event.altKey && event.code === "KeyR") {
    clearCacheAndReload();
  } else if (event.altKey && event.code === "KeyG") {
    window.open("https://github.com/AbnormalNormality/InfiniteCG", "_blank");
  }
}

document.addEventListener("keyup", handleKeyRelease);

//

function startMessage() {
  const basePath =
    window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");
  const creditsLink = basePath + "/pages/credits.html";

  console.log(
    "Thank you for playing %cInfiniteCG%c!\n" +
      "Alt+R to clear cache/reload\n" +
      "Alt+G to open the game's GitHub repository\n" +
      "Alt+C to view the credits: " +
      creditsLink,
    "color: #090",
    "color: #000"
  );
}

function checkForUpdates() {
  const lastUpdate = localStorage.getItem("lastUpdate");

  const repoUrl =
    "https://api.github.com/repos/abnormalnormality/infinitecg/commits/main";

  fetch(repoUrl)
    .then((response) => response.json())
    .then((data) => {
      if (!Object.keys(data).includes("sha")) {
        console.error("Invalid response from GitHub API");
        return;
      }
      const currentUpdate = data.sha.substring(0, 7);

      if (!lastUpdate) {
        localStorage.setItem("lastUpdate", currentUpdate);
      } else if (lastUpdate !== currentUpdate) {
        if (confirm("A new update is available. Do you want to reload?")) {
          localStorage.setItem("lastUpdate", currentUpdate);
          clearCacheAndReload();
        }
      }
    })
    .catch((error) => {
      console.error("Could not check for updates:", error);
    });
}

startMessage();
checkForUpdates();
combat.startTurn();
