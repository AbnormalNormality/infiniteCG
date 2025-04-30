const presets = {
  cards: {
    0: {
      name: "Debug Card 1",
      image: "assets/cards/0.png",
      background: "#fdd",
    },
    1: { name: "Debug Card 2", image: "assets/cards/1.png" },
  },
};

const player = {
  hand: [],
  deck: [],
  discardPile: [],
};

player.discardPile.push(presets.cards[0]);
player.discardPile.push(presets.cards[0]);
player.discardPile.push(presets.cards[0]);
player.discardPile.push(presets.cards[0]);
player.discardPile.push(presets.cards[1]);
player.discardPile.push(presets.cards[1]);
player.discardPile.push(presets.cards[1]);
player.discardPile.push(presets.cards[1]);

function startTurn() {
  draw(50);
  renderHand();
}

function endTurn() {
  player.discardPile.push(...player.hand);
  player.hand.length = 0;

  startTurn();
}

function draw(amount) {
  i = 0;
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

//

const hand = document.getElementById("hand");

let scrollAmount = 0;
let isScrolling = false;

hand.addEventListener(
  "wheel",
  function (event) {
    scrollAmount += event.deltaY;
    event.preventDefault();
    if (!isScrolling) smoothScroll();
  },
  { passive: false }
);

function smoothScroll() {
  isScrolling = true;
  const step = () => {
    const delta = scrollAmount * 0.25;
    hand.scrollLeft += delta;
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
  const original = event.currentTarget;

  const rect = original.getBoundingClientRect();

  draggedCard = original.cloneNode(true);
  draggedCard.style.position = "absolute";
  draggedCard.style.left = `${rect.left}px`;
  draggedCard.style.top = `${rect.top}px`;
  draggedCard.style.width = `${rect.width}px`;
  draggedCard.style.height = `${rect.height}px`;
  draggedCard.style.zIndex = 1000;
  draggedCard.style.pointerEvents = "none";
  draggedCard.style.margin = 0;

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
    draggedCard.remove();
    draggedCard = null;
  }

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}

function renderHand() {
  hand.innerHTML = "";

  player.hand.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.style.backgroundColor = card.background;
    cardElement.card = card;

    const cardName = document.createElement("div");
    cardName.className = "cardName";
    cardName.innerText = card.name;

    const cardImage = document.createElement("img");
    cardImage.className = "cardImage";
    cardImage.src = card.image;
    cardImage.draggable = false;

    cardElement.appendChild(cardName);
    cardElement.appendChild(cardImage);
    cardElement.addEventListener("mousedown", onMouseDown);
    hand.appendChild(cardElement);
  });
}

const endTurnButton = document.getElementById("endTurn");
endTurnButton.onclick = endTurn;

startTurn();

function clearCacheAndReload() {
  cardElement.addEventListener("mousedown", onMouseDown);
  if ("caches" in window) {
    caches
      .keys()
      .then(function (names) {
        for (let name of names) {
          caches.delete(name);
        }
      })
      .then(function () {
        window.location.reload(true); // Force reload
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

async function getLatestCommitMessage() {
  const url =
    "https://api.github.com/repos/AbnormalNormality/PokemonUtils/commits/main";

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();

    const isoDate = data.commit.author.date;
    const formattedDate = new Date(isoDate).toLocaleString("en-Au", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "shortGeneric",
    });

    author = data.commit.author;
    message = data.commit.message;

    console.log(`${formattedDate}: ${message}`);
  } catch (error) {
    console.log("Error fetching latest commit");
  }
}

function startMessage() {
  console.log(
    "Thank you for playing %cInfiniteCG%c!",
    "color: #090",
    "color: #000"
  );
  console.log("Alt+R to clear cache/reload");
}

startMessage();
getLatestCommitMessage();
