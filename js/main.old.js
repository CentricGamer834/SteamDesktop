// https://steamid.io/lookup
let STEAM_USER_ID = "";
// https://steamcommunity.com/dev/apikey
let STEAM_API_KEY = "";
// Proxy URL for CORS issues
const proxy = "https://corsproxy.io/?";

// DOM
const container = document.getElementById("game-container");
const loadingScreen = document.getElementById("loading-screen");
const loginScreen = document.getElementById("login-screen");
const errorScreen = document.getElementById("error-screen");
const sizeSelector = document.getElementById("size-options");
const sortSelector = document.getElementById("sort-options");

// UI Helpers
const showLoading = () => loadingScreen.style.visibility = "visible";
const hideLoading = () => loadingScreen.style.visibility = "hidden";
const showError = msg => {
    errorScreen.innerHTML = `<img src="./icon.png"><p>${msg}</p><a href="javascript:location.reload()">Reload</a>`;
    errorScreen.style.visibility = "visible";
    hideLoading();
};

// API Helpers
const fetchJson = async (url) => {
    const res = await fetch(url);
    return res.ok ? await res.json() : null;
};

const getOwnedGames = async () => {
    const url = `${proxy}https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_USER_ID}&include_appinfo=true&include_played_free_games=true`;
    const data = await fetchJson(url);
    return data?.response?.games || [];
};

const getAppDetails = async (appId) => {
    const url = `${proxy}https://store.steampowered.com/api/appdetails?appids=${appId}`;
    const data = await fetchJson(url);
    return data?.[appId]?.data || {};
};

const createAttachedPopout = (parent, child) => {
    const targetRect = parent.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const { scrollX, scrollY } = window;

    let left = targetRect.right + scrollX + 15
    let top = targetRect.top + scrollY;

    if (left + childRect.width > document.body.scrollWidth + scrollX) {
        left = targetRect.left - childRect.width + scrollX - 15
    }

    if (top + childRect.height > document.body.scrollHeight + scrollY) {
        top = targetRect.bottom - childRect.height + scrollY
    }

    left = Math.max(scrollX, Math.min(left, document.body.scrollWidth - childRect.width + scrollX));
    top = Math.max(scrollY, Math.min(top, document.body.scrollHeight - childRect.height + scrollY));

    child.style.left = `${left}px`;
    child.style.top = `${top}px`;

    return child
}

const createGamePopout = (parent, details, index) => {
    const { appid, playtime_forever, rtime_last_played, name, playtime_2weeks } = details;
    let currentPopout, popoutTimeout, hideTimeout;

    // Remove any existing popouts
    document.querySelectorAll(".popout").forEach(_popout => _popout.remove());

    const handleMouseEnter = () => {
        clearTimeout(popoutTimeout);
        clearTimeout(hideTimeout);

        popoutTimeout = setTimeout(async () => {
            if (!parent.matches(":hover")) return;

            const lastPlayed = parseInt(rtime_last_played);

            const recentMinutes = playtime_2weeks || 0,
                totalHours = (playtime_forever / 60).toFixed(1),
                totalMinutes = parseInt(playtime_forever),
                lastPlayedText = lastPlayed ? new Date(lastPlayed * 1000).toLocaleDateString() : "Never"

            const { screenshots, header_image } = await getAppDetails(appid);

            currentPopout = document.createElement("div");
            currentPopout.className = "popout";
            currentPopout.innerHTML = `
<div class="popout-name">${name}</div>
<div class="popout-cover-cover">
    <div class="popout-cover-crossfade">
        <div class="popout-cover" style="background-image: url(${header_image});"></div>
    </div>
</div>
<div class="popout-seperator"></div>
<div class="popout-stats-wrapper">
    <div class="popout-stats">
        <div class="popout-time-played">Time played</div>
        <div>Last two weeks: ${recentMinutes} min</div>
        <div>Total: ${totalHours} hrs | ${totalMinutes} min</div>
        <div>Most played ranking: #${index + 1}</div>
        <div>Last played: ${lastPlayedText}</div>
    </div>
</div>`;

            document.body.appendChild(currentPopout);
            createAttachedPopout(parent, currentPopout);
            currentPopout.classList.add("show");

            startCarousel(screenshots);
        }, 200);
    };

    const handleMouseLeave = () => {
        clearTimeout(popoutTimeout);

        hideTimeout = setTimeout(() => {
            if (currentPopout) {
                currentPopout.remove();
                currentPopout = null;
            }
        }, 200);
    };

    const startCarousel = (screenshots) => {
        if (!screenshots || screenshots.length === 0) return;

        const crossfade = currentPopout.querySelector(".popout-cover");
        crossfade.style.backgroundImage = `url(${screenshots[0]?.path_thumbnail || ""})`;

        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % screenshots.length;
            crossfade.style.backgroundImage = `url(${screenshots[currentIndex]?.path_thumbnail || ""})`;
        }, 1750);
    };

    const removePopout = () => {
        if (currentPopout) {
            currentPopout.remove();
            currentPopout = null;
        }
    };

    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);
    parent.addEventListener("mouseout", handleMouseLeave);

    document.addEventListener("mousemove", (e) => {
        if (currentPopout && !parent.contains(e.target) && !currentPopout.contains(e.target)) {
            removePopout();
        }
    })
};

const createGameModal = (parent, game) => {
    parent.addEventListener("mousedown", ev => {
        if (ev.button == 1 || ev.buttons == 4) {
            const modal = document.createElement("div");
            modal.style.height = "50%";
            modal.style.width = "50%";
            modal.style.transform = "translate(50%)";
            modal.style.position = "absolute";
            modal.style.margin = "auto";
            modal.style.backgroundColor = "#fff";
            modal.style.borderRadius = "8px";
            modal.innerText = "Hello I am under de watyer please halp"
            document.body.append(modal)
        }
    })
}

const createGameCard = (game, index, topAppIds) => {
    const { appid, name } = game;

    const gameTile = document.createElement("div");
    gameTile.className = "game-tile";
    gameTile.onclick = () => window.open(`steam://rungameid/${appid}`, "_blank");

    const tileInner = document.createElement("div");
    tileInner.className = "game-wrapper";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "panel-image-wrapper";

    const tileCover = new Image();
    tileCover.className = "game-art";
    tileCover.alt = name;

    // Bad fallback img code
    const fallback3 = () => {
        const altTextElm = document.createElement("div");
        altTextElm.className = "alt-text-elm";
        altTextElm.innerText = name;
        tileCover.src = "img/defaultappimage.png";
    };

    const fallback2 = () => {
        tileCover.onerror = fallback3;
        tileCover.src = `https://shared.steamstatic.com/store_item_assets/steam/apps/${appid}/portrait.png`;
    };

    const fallback1 = () => {
        tileCover.onerror = fallback2;
        tileCover.src = `https://shared.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`
    };

    tileCover.onerror = fallback1
    tileCover.src = `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900_2x.jpg`;
    imageWrapper.appendChild(tileCover);

    if (topAppIds.includes(appid)) {
        const rank = topAppIds.indexOf(appid) + 1;
        const badge = document.createElement("div");
        badge.className = `badge rank-${rank}`;
        badge.innerText = rank;
        tileInner.appendChild(badge);
    }

    tileInner.appendChild(imageWrapper);
    gameTile.appendChild(tileInner);
    container.appendChild(gameTile);

    createGamePopout(gameTile, game, index);
    createGameModal(gameTile, game);
};

// Display Games
const displayGames = async (sortType) => {
    const games = await getOwnedGames();
    if (!games.length) return showError("No games found, or your profile may be private.");

    games.sort((a, b) => b.playtime_forever - a.playtime_forever);

    switch (sortType) {
        case "name":
            games.sort((a, b) => a.name.localeCompare(b.name));
        case "recent":
            games.sort((a, b) => b.rtime_last_played - a.rtime_last_played);
        case "playtime":
        default:
            games.sort((a, b) => b.playtime_forever - a.playtime_forever);
    }

    const topAppIds = games.slice(0, 3).map((g) => g.appid);

    container.innerHTML = "";
    games.forEach((game, index) => createGameCard(game, index, topAppIds));
};

// Login Check
const validateSteamCredentials = async (steamId, apiKey) => {
    try {
        const url = `${proxy}https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}`;
        const data = await fetchJson(url);
        return !!data?.response?.games;
    } catch (error) {
        console.error("Error validating Steam credentials:", error);
        return false;
    }
};

const promptForSteamCredentials = async () => {
    const steamId = localStorage.getItem("steamId") || "";
    const apiKey = localStorage.getItem("apiKey") || "";
    const rememberMe = localStorage.getItem("rememberMe") === "true";

    const showLogin = () => (loginScreen.style.visibility = "visible");
    const hideLogin = () => (loginScreen.style.visibility = "hidden");

    const loginForm = document.getElementById("login-form");
    const idInput = document.getElementById("accountId");
    const keyInput = document.getElementById("apiKey");
    const rememberMeCheckbox = document.getElementById("rememberMe");

    if (rememberMe) {
        idInput.value = steamId;
        keyInput.value = apiKey;
        rememberMeCheckbox.checked = true;
    }

    return new Promise((resolve, reject) => {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const steamId = idInput.value.trim();
            const apiKey = keyInput.value.trim();

            if (await validateSteamCredentials(steamId, apiKey)) {
                hideLogin();

                if (rememberMeCheckbox.checked) {
                    localStorage.setItem("steamId", steamId);
                    localStorage.setItem("apiKey", apiKey);
                    localStorage.setItem("rememberMe", "true");
                } else {
                    localStorage.clear();
                }

                resolve({ steamId, apiKey });
            } else {
                showError("Invalid credentials, or something went wrong! Please try again!");
                return reject()
            }
        });

        showLogin();
    });
};

// Init
(async function Init() {
    showLoading();

    try {
        const { steamId, apiKey } = await promptForSteamCredentials();
        console.log("Steam ID:", steamId);
        console.log("API Key:", apiKey);

        STEAM_USER_ID = steamId;
        STEAM_API_KEY = apiKey;

        await displayGames();
    } catch (err) {
        console.error("Error during initialization:", err);
        showError("An error occurred while fetching your games. <br/> Please check your Steam API Key and User ID.");
    } finally {
        hideLoading();
    }
})();

// Event Listeners
sizeSelector.addEventListener("change", (event) => {
    const selectedSize = event.target.value;
    container.classList.remove("small", "smaller", "smallest", "umm", "wtf");
    if (selectedSize)
        container.classList.add(selectedSize);
});

sortSelector.addEventListener("change", (event) => {
    const selectedSort = event.target.value;
    if (selectedSort)
        displayGames(selectedSort);
});
