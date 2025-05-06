const presets = {
  cards: {
    0: {
      name: "Debug Card 1",
      image: "assets/cards/0.png",
      background: "#fdd",
      id: 0,
      type: "card",
      description: "Debug description",
    },
    1: {
      name: "Debug Card 2",
      image: "assets/cards/1.png",
      background: "#fdf",
      id: 1,
      type: "card",
      description: "Looooooooooooooooooooooooooooooooong description",
    },
    2: {
      name: "Debug Card 3",
      image: "assets/cards/2.png",
      background: "#ddf",
      id: 2,
      type: "card",
      description: `Multiple
rows,
like,
more
than
3`,
    },
  },
  enemies: {
    0: {
      name: "Debug Enemy 1",
      image: "assets/enemies/0.png",
      background: "#dfd",
      id: 0,
      type: "enemy",
      maxHp: 50,
      hp: 0,
    },
    1: {
      name: "Debug Enemy 2",
      image: "assets/enemies/1.png",
      background: "#ddf",
      id: 1,
      type: "enemy",
      maxHp: 69,
      hp: 0,
    },
    2: {
      name: "Debug Enemy 3",
      image: "assets/enemies/2.png",
      background: "#dff",
      id: 2,
      type: "enemy",
      maxHp: 42,
      hp: 0,
    },
  },
};

const player = {
  hand: [],
  deck: [],
  discardPile: [],
  maxHp: 50,
  hp: 0,
  energy: 0,
  turnEnergy: 3,
};

player.discardPile.push(presets.cards[0]);
player.discardPile.push(presets.cards[0]);
player.discardPile.push(presets.cards[0]);
player.discardPile.push(presets.cards[0]);
player.discardPile.push(presets.cards[1]);
player.discardPile.push(presets.cards[1]);
player.discardPile.push(presets.cards[1]);
player.discardPile.push(presets.cards[2]);

const combat = {
  enemies: [],
};

addEnemy(presets.enemies[0]);
addEnemy(presets.enemies[1]);
addEnemy(presets.enemies[2]);
addEnemy(presets.enemies[2]);

const hand = document.getElementById("hand");
const enemies = document.getElementById("enemies");
const endTurnButton = document.getElementById("endTurn");

let scrollAmount = 0;
let isScrolling = false;

hand.addEventListener(
  "wheel",
  function (event) {
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

let draggedCard = null;
let offsetX = 0;
let offsetY = 0;

function onMouseDown(event) {
  if (player.energy <= 0) {
    return;
  }

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

  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(event) {
  if (draggedCard) {
    draggedCard.style.left = `${event.clientX - offsetX}px`;
    draggedCard.style.top = `${event.clientY - offsetY}px`;
  }
}

function onMouseUp(event) {
  if (draggedCard) {
    const indexInHand = draggedCard.getAttribute("data-index-in-hand");
    const draggedCardData = player.hand[parseInt(indexInHand)];

    const releasePointX = event.clientX;
    const releasePointY = event.clientY;

    const elementBelowRelease = document.elementFromPoint(
      releasePointX,
      releasePointY
    );

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
    }

    let targetEnemyData = [];

    if (targetEnemy && targetEnemy !== "all") {
      const indexInHand = targetEnemy.getAttribute("data-index-in-enemies");
      targetEnemyData.push(combat.enemies[parseInt(indexInHand)]);
    } else if (targetEnemy === "all") {
      targetEnemyData.push(combat.enemies);
    }

    if (targetEnemyData.length > 0) {
      cardInteraction(draggedCardData, targetEnemyData);
    }

    draggedCard.remove();
    draggedCard = null;
  }

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}

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
    cardElement.addEventListener("mousedown", onMouseDown);
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
}

function startTurn() {
  player.energy = player.turnEnergy;
  draw(5);
  updateDisplay();
}

function endTurn() {
  player.discardPile.push(...player.hand);
  player.hand.length = 0;
  startTurn();
}

function draw(amount) {
  let i = 0;
  while (i < amount && player.deck.length + player.discardPile.length > 0) {
    if (player.deck.length === 0) {
      player.deck.push(...player.discardPile);
      player.discardPile.length = 0;
      shuffle(player.deck);
    }
    player.hand.push(player.deck.pop());
    i++;
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function addEnemy(enemy) {
  enemy = Object.assign({}, enemy);

  enemy.hp = enemy.maxHp;
  combat.enemies.push(enemy);
}

function cardInteraction(card, targets) {
  if (player.energy <= 0) {
    return;
  }
  player.energy--;

  targets.forEach((enemy) => {
    modifyEnemyHp(enemy, -1);
  });

  updateDisplay();
}

function modifyEnemyHp(enemy, value) {
  enemy.hp = Math.max(0, enemy.hp + value);
}

function initPlayer() {
  player.hp = player.maxHp;
}

const playerHp = document.getElementById("playerHp");
const playerEnergy = document.getElementById("playerEnergy");

function updatePlayerUi() {
  playerHp.value = player.hp;
  playerHp.max = player.maxHp;

  playerEnergy.value = player.energy;
  playerEnergy.max = player.turnEnergy;

  // playerEnergy.textContent = `${player.energy} / ${player.turnEnergy} Energy`;
}

initPlayer();

endTurnButton.onclick = endTurn;

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
  }
}

document.addEventListener("keyup", handleKeyRelease);

startTurn();

function startMessage() {
  console.log(
    "Thank you for playing %cInfiniteCG%c!",
    "color: #090",
    "color: #000"
  );
  console.log("Alt+R to clear cache/reload");
}

startMessage();
