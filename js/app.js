// Development
// TODO: proxy stuff
const PROXY_URL = "https://corsproxy.io/?";
const SETTINGS_STORAGE_KEY = "steamSettings";

const steamUserId = localStorage.getItem("steamId") || "";
const steamApiKey = localStorage.getItem("apiKey") || "";
// TODO
// re-code this AI generated settings manager
const settings = (() => {
	let state = {};
	const listeners = [];

	const saved = localStorage.getItem("steamSettings");
	if (saved) state = JSON.parse(saved);

	function save() {
		localStorage.setItem("steamSettings", JSON.stringify(state));
	}

	return {
		get(key) {
			return state[key] || null;
		},
		set(key, value) {
			if (state[key] === value) return;
			state[key] = value;
			save();
			// Notify listeners for this key only
			listeners.forEach(({ key: listenKey, cb, lastValue }, i) => {
				if (listenKey === null || listenKey === key) {
					if (state[key] !== lastValue) {
						cb(state);
						listeners[i].lastValue = state[key];
					}
				}
			});
		},
		onChange(keyOrCb, maybeCb) {
			if (typeof keyOrCb === "function") {
				// onChange(callback) - listen to all keys
				listeners.push({ key: null, cb: keyOrCb, lastValue: null });
				return () => {
					const i = listeners.findIndex(l => l.cb === keyOrCb);
					if (i !== -1) listeners.splice(i, 1);
				};
			} else if (typeof keyOrCb === "string" && typeof maybeCb === "function") {
				// onChange(key, callback)
				listeners.push({ key: keyOrCb, cb: maybeCb, lastValue: state[keyOrCb] });
				return () => {
					const i = listeners.findIndex(l => l.cb === maybeCb && l.key === keyOrCb);
					if (i !== -1) listeners.splice(i, 1);
				};
			} else {
				throw new Error("Invalid arguments to settings.onChange");
			}
		},
	};
})();

// #region DOM Elements
const $ = (id) => document.getElementById(id);

const loadingScreen = $("loading-screen");
const errorScreen = $("error-screen");
const gamesContainer = $("games");
const logoutBtn = $("logout-button");
const settingsModal = $("settings-modal");
const openSettingsBtn = $("settings-button");
const closeSettingsBtn = $("close-settings");
const settingsModalBackdrop = $("settings-modal-backdrop");
const userAvatar = $("user-avatar");
const userName = $("user-name");
const userId = $("user-id");
// #endregion DOM Elements

// #region UI Functions
const showLoading = () => loadingScreen.removeAttribute("hidden");
const hideLoading = () => loadingScreen.setAttribute("hidden", "true");
const displayError = (msg, isFatal = true) => {
	errorScreen.innerHTML = `
<img src="img/icon_478x478.png" alt="Error Icon" />
<p>${msg}</p>
<div class="error-actions">
    <a href="javascript:location.reload()">Reload</a>
    ${isFatal ? '<a href="login.html">Return to Login</a>' : ''}
</div>
    `;

	errorScreen.removeAttribute("hidden");
	hideLoading();
};

const clearSessionAndRedirect = (msg, redirect = "login.html", delay = 3000) => {
	localStorage.removeItem("steamId");
	localStorage.removeItem("apiKey");
	displayError(`An error may have occured, Please login again <br/> ${msg} <br/> Redirecting in ${delay / 1000} seconds...`, true);
	setTimeout(() => window.location.replace(redirect), delay);
};

function attachFloaterToParent(parent, popout) {
	const { scrollX, scrollY } = window;
	const rect = parent.getBoundingClientRect();
	const pRect = popout.getBoundingClientRect();
	let left = rect.right + scrollX + 15;
	let top = rect.top + scrollY;

	if (left + pRect.width > document.body.scrollWidth + scrollX) {
		left = rect.left - pRect.width + scrollX - 15;
	}
	if (top + pRect.height > document.body.scrollHeight + scrollY) {
		top = rect.bottom - pRect.height + scrollY;
	}

	popout.style.left = `${Math.max(scrollX, left)}px`;
	popout.style.top = `${Math.max(scrollY, top)}px`;
	return popout;
}

function setupGameMenuTrigger(card, game) {
	const menuBackdrop = document.createElement("div");
	menuBackdrop.style.position = "fixed";
	menuBackdrop.style.top = "0";
	menuBackdrop.style.left = "0";
	menuBackdrop.style.width = "100%";
	menuBackdrop.style.height = "100%";
	menuBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	menuBackdrop.style.zIndex = 9999;

	const menu = document.createElement("div");
	menu.style.position = "absolute";
	menu.style.zIndex = 10000;
	menu.style.background = "#222";
	menu.style.border = "1px solid #444";
	menu.style.borderRadius = "4px";
	menu.style.padding = "4px 0";
	menu.style.minWidth = "180px";
	menu.style.color = "#eee";
	menu.style.fontSize = "14px";
	menu.style.userSelect = "none";

	const links = [
		{ label: "Play", url: `steam://rungameid/${game.appid}` },
		{ label: "View on Steam", url: `https://store.steampowered.com/app/${game.appid}` },
		{ label: "View News", url: `https://store.steampowered.com/app/${game.appid}/news/` },
		{ label: "View Screenshots", url: `https://store.steampowered.com/app/${game.appid}/screenshots/` },
		{ label: "View Videos", url: `https://store.steampowered.com/app/${game.appid}/videos/` },
	];

	links.forEach(({ label, url }) => {
		const item = document.createElement("div");
		item.className = "menu-item";
		item.textContent = label;
		item.style.padding = "6px 16px";
		item.style.cursor = "pointer";
		item.style.whiteSpace = "nowrap";

		item.addEventListener("mouseenter", () => {
			item.style.backgroundColor = "#444";
		});

		item.addEventListener("mouseleave", () => {
			item.style.backgroundColor = "transparent";
		});

		item.addEventListener("click", () => {
			window.open(url, "_blank");
			hideMenu();
		});

		menu.appendChild(item);
	});

	function showMenu(x, y) {
		document.body.appendChild(menuBackdrop);
		document.body.appendChild(menu);
		attachFloaterToParent(card, menu);
	}

	const hideMenu = () => {
		menu.remove();
		menuBackdrop.remove();
	};

	card.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		showMenu(e.pageX, e.pageY);
	});

	document.addEventListener("click", (e) => {
		if (!menu.contains(e.target)) {
			hideMenu();
		}
	});

	menuBackdrop.addEventListener("click", () => {
		hideMenu();
	});
	window.addEventListener("scroll", hideMenu);
	window.addEventListener("resize", hideMenu);
	window.addEventListener("mouseleave", hideMenu);
	window.addEventListener("blur", hideMenu);
}

function setupGamePopoutTrigger(card, game, rankIndex) {
	let popout = null;
	let delayIn, delayOut, carousel;

	const clear = () => {
		if (popout) popout.remove();
		popout = null;
		if (carousel) clearInterval(carousel);
	};

	const startCarousel = (imgs) => {
		const el = popout.querySelector(".popout-carousel");
		let i = 0;
		el.style.backgroundImage = `url(${imgs[0].path_thumbnail || ""})`;
		carousel = setInterval(() => {
			i = (i + 1) % imgs.length;
			el.style.backgroundImage = `url(${imgs[i].path_thumbnail || ""})`;
		}, 1750);
	};

	const showPopout = async () => {
		try {
			const {
				playtime_forever,
				rtime_last_played,
				playtime_2weeks,
				appid
			} = game;

			const {
				header_image,
				screenshots
			} = await fetchAppDetails(appid);

			const lastPlayedTimestamp = parseInt(rtime_last_played, 10);
			const recentPlayMinutes = (playtime_2weeks || 0);
			const totalHoursPlayed = (playtime_forever / 60).toFixed(1);
			const lastPlayedDate = lastPlayedTimestamp
				? new Date(lastPlayedTimestamp * 1000).toLocaleDateString()
				: "Never";

			popout = document.createElement("div");
			popout.className = "popout";
			popout.innerHTML = `
<div class="popout-title">${game.name || "Unknown Game"}</div>
<div class="popout-carousel" style="background-image: url(${header_image || ""});"></div>
<div class="popout-seperator"></div>
<div class="popout-stats-wrapper">
    <div class="popout-stats">
        <div class="popout-time-played">Time played</div>
        <div>Last two weeks: ${recentPlayMinutes} min</div>
        <div>Total: ${totalHoursPlayed ? totalHoursPlayed + "hrs" : "Unknown"} | ${playtime_forever ? playtime_forever + "min" : "Unknown"}</div>
        <div>${/** TODO */"Sort type"} ranking: ${(rankIndex + 1) ? "#" + (rankIndex + 1) : "Unknown"}</div>
        <div>Last played: ${lastPlayedDate ? lastPlayedDate : "Unknown"}</div>
    </div>
</div>`;
			document.body.appendChild(popout);
			attachFloaterToParent(card, popout);
			popout.classList.add("show");
			if (screenshots?.length) startCarousel(screenshots);
		} catch (err) {
			console.error("Popout error:", err);
		}
	};

	const scheduleShow = () => {
		clearTimeout(delayIn);
		clearTimeout(delayOut);
		delayIn = setTimeout(() => card.matches(":hover") && showPopout(), 200);
	}

	const scheduleRemove = () => {
		clearTimeout(delayIn);
		delayOut = setTimeout(clear, 200);

		window.removeEventListener("contextmenu", scheduleRemove);
		window.removeEventListener("mouseleave", scheduleRemove);
		window.removeEventListener("blur", scheduleRemove);
	};

	card.addEventListener("mouseenter", scheduleShow);

	card.addEventListener("mouseleave", scheduleRemove);
	card.addEventListener("mouseout", scheduleRemove);
	window.addEventListener("contextmenu", scheduleRemove);
	window.addEventListener("mouseleave", scheduleRemove);
	window.addEventListener("blur", scheduleRemove);

	document.addEventListener("mousemove", (e) => {
		if (popout && !card.contains(e.target) && !popout.contains(e.target)) clear();
	});
}

function createGameCard(game, index, rankedIds) {
	const card = document.createElement("section");
	card.className = "game-card";
	card.setAttribute("role", "link");
	card.onclick = () => {
		// Todo
		if (settings.get("redirectToSite")) {
			window.open(`https://store.steampowered.com/app/${game.appid}`, "_blank");
		} else {
			window.open(`steam://rungameid/${game.appid}`, "_blank");
		}
	}

	const shard = document.createElement("div");
	shard.className = "panel-shard";

	const coverImg = new Image();
	coverImg.className = "cover-image";
	coverImg.alt = game.name || "Game Cover";

	const fallbackImages = [
		`https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/library_600x900_2x.jpg`,
		`https://shared.steamstatic.com/store_item_assets/steam/apps/${game.appid}/library_600x900.jpg`,
		`https://shared.steamstatic.com/store_item_assets/steam/apps/${game.appid}/portrait.png`,
		"img/defaultappimage.png"
	];

	let fallbackIndex = 0;
	coverImg.onerror = () => {
		if (fallbackIndex < fallbackImages.length - 1) {
			coverImg.src = fallbackImages[++fallbackIndex];
		} else {
			coverImg.style.display = "none";
			const fallbackText = document.createElement('div');
			fallbackText.className = "fallback-text";
			fallbackText.textContent = game.name || "Unknown Game";
			card.appendChild(fallbackText);
		}
	};

	coverImg.src = fallbackImages[0];

	const generateBadge = () => {
		if (rankedIds.includes(game.appid)) {
			const rank = rankedIds.indexOf(game.appid) + 1;
			const badge = document.createElement("div");
			badge.className = `badge rank-${rank}`;
			badge.innerText = rank;
			card.appendChild(badge);
		}
	}

	settings.onChange("showBadges", (state) => {
		if (state.showBadges === true) {
			generateBadge();
		} else {
			const badge = card.querySelector(".badge");
			if (badge) badge.remove();
		}
	})

	if (settings.get("showBadges") === true) {
		generateBadge();
	}

	card.append(coverImg, shard);
	setupGamePopoutTrigger(card, game, index);
	setupGameMenuTrigger(card, game);

	return card;
}

function sortAndRenderGames(games) {
	const cachedGames = [...games];
	function _sortAndRenderGames() {
		try {
			let sorted = [...cachedGames];
			switch (settings.get("sortType")) {
				case "name":
					sorted.sort((a, b) => a.name.localeCompare(b.name));
					break;
				case "recent":
					sorted.sort((a, b) => b.rtime_last_played - a.rtime_last_played);
					break;
				default:
					sorted.sort((a, b) => b.playtime_forever - a.playtime_forever);
			}

			const topIds = sorted.slice(0, 3).map(g => g.appid);
			gamesContainer.innerHTML = "";
			sorted.forEach((game, rank) =>
				gamesContainer.appendChild(createGameCard(game, rank, topIds))
			);
		} catch (e) {
			displayError("Render error: " + e.message);
		}
	}

	_sortAndRenderGames();

	settings.onChange("sortType", () => {
		_sortAndRenderGames();
	});
}

async function renderUserDetails() {
	const {
		avatarmedium,
		personaname,
		steamid
	} = await fetchUserDetails();

	userAvatar.src = avatarmedium || "img/defaultuserimage.png";
	userAvatar.onerror = () => {
		userAvatar.src = "img/defaultuserimage.png";
	}

	userName.innerText = personaname || "Unknown User";

	userId.innerText = steamid || "Unknown ID";
}

function initAppSettings() {
	const defaultSettings = {
		sortType: {
			label: "Sort by",
			value: "playtime",
			type: "select",
			options: [
				{ value: "playtime", label: "Playtime" },
				{ value: "recent", label: "Recently Played" },
				{ value: "name", label: "Name" }
			]
		},
		redirectToSite: {
			label: "Open links in browser",
			value: false,
			type: "checkbox"
		},
		showBadges: {
			label: "Show badges",
			value: true,
			type: "checkbox"
		},
		badInterwebs: {
			label: "Bad internet? Reduce network usage.",
			value: false,
			type: "checkbox"
		}
	};

	const container = $("settings-container");
	if (!container) return console.error("⚠️ No #settings-container element found");

	// Load saved state or default values
	const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}");

	// Initialize settings state from saved or default values
	for (const key in defaultSettings) {
		const savedVal = savedSettings[key];
		settings.set(key, savedVal !== undefined ? savedVal : defaultSettings[key].value);
	}

	// Render settings inputs
	container.innerHTML = Object.entries(defaultSettings).map(([key, { label, value, type, options }]) => {
		let input = `<div class="form-group">
<label for="${key}">${label}</label>
`;
		if (type === "select") {
			input += `<select id="${key}">${options.map(opt => `<option value="${opt.value}" ${opt.value === settings.get(key) ? "selected" : ""}>${opt.label}</option>`).join("")}</select>`;
		} else if (type === "checkbox") {
			input += `<input type="checkbox" id="${key}" ${settings.get(key) ? "checked" : ""}>`;
		} else {
			input += `<input type="text" id="${key}" value="${settings.get(key) || ""}">`;
		}

		return `${input}</div>`;
	}).join("");

	// Add event listeners for inputs to update settings state
	Object.keys(defaultSettings).forEach(key => {
		const el = $(key);
		if (!el) return;

		if (el.type === "checkbox") {
			el.addEventListener("change", () => settings.set(key, el.checked));
		} else {
			el.addEventListener("change", () => settings.set(key, el.value));
		}
	});

	[openSettingsBtn, closeSettingsBtn].forEach(btn => {
		btn.addEventListener("click", () => {
			settingsModal.hidden = true;
		});
	});

	settingsModalBackdrop.addEventListener("click", () => {
		settingsModal.hidden = true;
	});

	openSettingsBtn.addEventListener("click", () => {
		settingsModal.removeAttribute("hidden");
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && !settingsModal.hidden) {
			settingsModal.hidden = true;
		}
	});
}

// #endregion UI Functions

// #region Network functions
async function fetchJson(url) {
	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
		return await res.json();
	} catch (err) {
		console.error("fetchJson error:", err);
		throw new Error(`Network or fetch error: ${err.message}`);
	}
}

async function fetchOwnedGames() {
	if (!steamUserId || !steamApiKey) throw new Error("Missing Steam credentials.");
	const url = `${PROXY_URL}https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamUserId}&include_appinfo=1&include_played_free_games=1&format=json`;
	const data = await fetchJson(url);
	if (!data?.response?.games?.length) throw new Error("No games found.");
	return data.response.games || {};
}

async function fetchAppDetails(appId) {
	const url = `${PROXY_URL}https://store.steampowered.com/api/appdetails?appids=${appId}`;
	const data = await fetchJson(url);
	return data?.[appId]?.data || {};
}

async function fetchUserDetails() {
	const url = `${PROXY_URL}https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamUserId}`;
	const data = await fetchJson(url);
	return data.response.players?.[0] || {};
}
// #endregion Network functions


// #region INIT
async function loadAndRender() {
	showLoading();
	errorScreen.setAttribute("hidden", "true");
	try {
		const games = await fetchOwnedGames();
		if (!games.length) return clearSessionAndRedirect("No games found.");
		logoutBtn.onclick = () => clearSessionAndRedirect("Logging out...", "login.html", 500);
		initAppSettings();
		sortAndRenderGames(games);
		renderUserDetails();
	} catch (e) {
		if (/missing|invalid/i.test(e.message))
			clearSessionAndRedirect("Invalid Steam ID or API Key. Please log in again.")
		else
			displayError("Load error: " + e.message);
	} finally {
		hideLoading();
	}
}


document.addEventListener("DOMContentLoaded", () => {
	loadAndRender();
});
// #endregion INIT