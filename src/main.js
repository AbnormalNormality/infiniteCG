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
  } else if (event.altKey && event.code === "KeyC") {
    const basePath =
      window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");
    const creditsLink = basePath + "/pages/credits.html";
    window.open(creditsLink, "_blank");
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
    "color: unset"
  );
}

startMessage();

fetch(
  "https://cdn.jsdelivr.net/gh/abnormalnormality/scripts-and-pieces@main/update.js"
)
  .then((response) => response.text())
  .then((script) => {
    eval(script);
  });
