const presets = {
  cards: {
    0: {
      name: "Debug Card 1",
      image: "/assets/cards/0.png",
      background: "#fdd",
    },
    1: { name: "Debug Card 2", image: "/assets/cards/1.png" },
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

function renderHand() {
  hand.innerHTML = "";

  player.hand.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.style.backgroundColor = card.background;

    const cardName = document.createElement("div");
    cardName.className = "cardName";
    cardName.innerText = card.name;

    const cardImage = document.createElement("img");
    cardImage.className = "cardImage";
    cardImage.src = card.image;

    cardElement.appendChild(cardName);
    cardElement.appendChild(cardImage);
    hand.appendChild(cardElement);
  });
}

const endTurnButton = document.getElementById("endTurn");
endTurnButton.onclick = endTurn;

startTurn();
