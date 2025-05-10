// Static Variables
let STEAM_USER_ID = "";
let STEAM_API_KEY = "";
const PROXY_URL = "https://corsproxy.io/?";

// Member Variables
const container = document.getElementById("game-container");
const loadingScreen = document.getElementById("loading-screen");
const errorScreen = document.getElementById("error-screen");
const sizeSelector = document.getElementById("size-options");
const sortSelector = document.getElementById("sort-options");

// UI Helpers
const showLoading = () => loadingScreen.removeAttribute("hidden");
const hideLoading = () => loadingScreen.setAttribute("hidden", "true");
const showLoginTimeout = () => {
	showError("Session expired or something went wrong. Please log in again. <br/> Redirecting to login page in 5 seconds...");
	setTimeout(() => location.href = "https://centricgamer834.github.io/SteamDesktop/login", 5000);
};

const showError = (msg) => {
	errorScreen.innerHTML = `<img src="/img/icon.png"><p>${msg}</p><a href="javascript:location.reload()">Reload</a>`;
	errorScreen.removeAttribute("hidden");
	hideLoading();
};

// API Helpers
const fetchJson = async (url) => {
	const res = await fetch(url);
	return res.ok ? await res.json() : null;
};

// Validate and fetch games from local credentials
const getOwnedGames = async () => {
	const url = `${PROXY_URL}https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_USER_ID}&include_appinfo=1&include_played_free_games=1&format=json`;

	try {
		const res = await fetch(url);
		if (!res.ok) {
			return showError(`Error: ${res.status}`);
		}

		const data = await res.json();
		if (!data?.response?.game_count || !Array.isArray(data.response.games)) {
			return showError("Invalid Steam ID or no games found on this account.");
		}

		return data?.response?.games || [];
	} catch (err) {
		console.error("Login failed:", err);
		showError(`Network or Steam API error. Details: ${err.message}`);
	}
};

const getAppDetails = async (appId) => {
	const url = `${PROXY_URL}https://store.steampowered.com/api/appdetails?appids=${appId}`;
	const data = await fetchJson(url);
	return data?.[appId]?.data || {};
};

const createAttachedPopout = (parent, child) => {
	const { scrollX, scrollY } = window;
	const parentRect = parent.getBoundingClientRect();
	const childRect = child.getBoundingClientRect();

	let left = parentRect.right + scrollX + 15;
	let top = parentRect.top + scrollY;

	if (left + childRect.width > document.body.scrollWidth + scrollX) {
		left = parentRect.left - childRect.width + scrollX - 15;
	}
	if (top + childRect.height > document.body.scrollHeight + scrollY) {
		top = parentRect.bottom - childRect.height + scrollY;
	}

	child.style.left = `${Math.max(scrollX, Math.min(left, document.body.scrollWidth - childRect.width + scrollX))}px`;
	child.style.top = `${Math.max(scrollY, Math.min(top, document.body.scrollHeight - childRect.height + scrollY))}px`;

	return child;
};

// Popout and Modal Logic
const createGamePopout = (parent, details, index) => {
	let currentPopout = null;
	let popoutTimeout = null;
	let hideTimeout = null;

	const removePopout = () => {
		if (currentPopout) {
			currentPopout.remove();
			currentPopout = null;
		}
	};

	const startCarousel = (screenshots) => {
		setTimeout(() => {
			if (!currentPopout || !screenshots?.length) return;

			const carousel = currentPopout.querySelector(".popout-carousel");
			carousel.style.backgroundImage = `url(${screenshots[0]?.path_thumbnail || ""})`;

			let currentIndex = 0;
			setInterval(() => {
				currentIndex = (currentIndex + 1) % screenshots.length;
				carousel.style.backgroundImage = `url(${screenshots[currentIndex]?.path_thumbnail || ""})`;
			}, 1750);
		}, 1000);
	};

	const showPopout = async () => {
		const { appid, playtime_forever, rtime_last_played, playtime_2weeks } = details;
		const lastPlayed = parseInt(rtime_last_played);
		const recentMinutes = playtime_2weeks || 0;
		const totalHours = (playtime_forever / 60).toFixed(1);
		const lastPlayedText = lastPlayed ? new Date(lastPlayed * 1000).toLocaleDateString() : "Never";
		const { screenshots, header_image, name } = await getAppDetails(appid);

		currentPopout = document.createElement("div");
		currentPopout.className = "popout";
		currentPopout.innerHTML = `
<div class="popout-title">${name}</div>
<div class="popout-carousel" style="background-image: url(${header_image});"></div>
<div class="popout-seperator"></div>
<div class="popout-stats-wrapper">
	<div class="popout-stats">
		<div class="popout-time-played">Time played</div>
		<div>Last two weeks: ${recentMinutes} min</div>
		<div>Total: ${totalHours} hrs | ${playtime_forever} min</div>
		<div>Most played ranking: #${index + 1}</div>
		<div>Last played: ${lastPlayedText}</div>
	</div>
</div>`;

		document.body.appendChild(currentPopout);
		createAttachedPopout(parent, currentPopout);
		currentPopout.classList.add("show");
		startCarousel(screenshots);
	};

	parent.addEventListener("mouseenter", () => {
		clearTimeout(popoutTimeout);
		clearTimeout(hideTimeout);
		popoutTimeout = setTimeout(() => parent.matches(":hover") && showPopout(), 200);
	});

	const clearPopoutOnLeave = () => {
		clearTimeout(popoutTimeout);
		hideTimeout = setTimeout(removePopout, 200);
	};

	parent.addEventListener("mouseleave", clearPopoutOnLeave);
	parent.addEventListener("mouseout", clearPopoutOnLeave);

	document.addEventListener("mousemove", (e) => {
		if (currentPopout && !parent.contains(e.target) && !currentPopout.contains(e.target)) {
			removePopout();
		}
	});
};

// Placeholder Modal Logic (for MMB ? what is MMB lol)
const createGameModal = (parent, game) => {
	parent.addEventListener("mousedown", (ev) => {
		if (ev.button === 1 || ev.buttons === 4) {
			const modal = document.createElement("div");
			modal.className = "game-modal";
			modal.innerText = "TODO: Game modal under construction.";
			document.body.append(modal);
		}
	});
};

// Game Card Generation
const createGameCard = (game, index, topAppIds) => {
	const { appid, name } = game;

	const card = document.createElement("div");
	card.className = "game-card";
	card.onclick = () => window.open(`steam://rungameid/${appid}`, "_blank");

	const coverImg = new Image();
	coverImg.className = "cover-image";
	coverImg.alt = name;

	const panelShard = document.createElement("div");
	panelShard.className = "panel-shard";

	const useFallbackImage = (src, onError) => {
		coverImg.onerror = onError;
		coverImg.src = src;
	};

	const insertNameIfMissing = () => {
		const fallback = document.createElement("div");
		fallback.className = "alt-text-elm";
		fallback.innerText = name;
		coverImg.src = "/img/defaultappimage.png";
		card.appendChild(fallback);
	};

	// TODO: Fix Fallback image loading sequence
	useFallbackImage(
		`https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900_2x.jpg`,
		() => useFallbackImage(
			`https://shared.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`,
			() => useFallbackImage(
				`https://shared.steamstatic.com/store_item_assets/steam/apps/${appid}/portrait.png`,
				insertNameIfMissing
			)
		)
	);

	if (topAppIds.includes(appid)) {
		const rank = topAppIds.indexOf(appid) + 1;
		const badge = document.createElement("div");
		badge.className = `badge rank-${rank}`;
		badge.innerText = rank;
		card.appendChild(badge);
	}

	card.append(coverImg, panelShard);

	createGamePopout(card, game, index);
	createGameModal(card, game);

	return card;
};

const sortAndDisplayGames = (games, sortType) => {
	if (!games.length) throw new Error("No games found");

	let sortedGames;
	if (sortType === "name") {
		sortedGames = games.slice().sort((a, b) => a.name.localeCompare(b.name));
	} else if (sortType === "recent") {
		sortedGames = games.slice().sort((a, b) => b.rtime_last_played - a.rtime_last_played);
	} else {
		sortedGames = games.slice().sort((a, b) => b.playtime_forever - a.playtime_forever);
	}

	const top3 = sortedGames.slice(0, 3).map(g => g.appid);

	container.innerHTML = "";
	sortedGames.forEach((game, index) => {
		container.appendChild(createGameCard(game, index, top3));
	});
};

// App Entry
(async function appInit() {
	showLoading();
	try {
		const steamId = localStorage.getItem("steamId") || "";
		const apiKey = localStorage.getItem("apiKey") || "";

		// Save globally
		STEAM_USER_ID = steamId;
		STEAM_API_KEY = apiKey;

		const games = await getOwnedGames();
		sortSelector.addEventListener("change", (event) => {
			const selectedSort = event.target.value;
			if (selectedSort) sortAndDisplayGames(games, selectedSort);
		});

		if (games) sortAndDisplayGames(games, sortSelector.value || "playtime");
		else showLoginTimeout();
	} catch (err) {
		console.error("App initialization failed:", err);
		showError(`Failed to load your game library. <br>Check your Steam ID and API Key.`);
		showLoginTimeout();
	} finally {
		hideLoading();
	}
})();

// Event Listeners
sizeSelector.addEventListener("change", (event) => {
	const selectedSize = event.target.value;
	[...sizeSelector.options].forEach((option) => {
		container.classList.remove(option.value);
	});

	if (selectedSize)
		container.classList.add(selectedSize);
});