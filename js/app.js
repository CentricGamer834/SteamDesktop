// Development
// TODO: proxy stuff
const PROXY_URL = "https://corsproxy.io/?";
const steamUserId = localStorage.getItem("steamId") || "";
const steamApiKey = localStorage.getItem("apiKey") || "";

const loadingScreen = document.getElementById("loading-screen");
const errorScreen = document.getElementById("error-screen");
const gamesContainer = document.getElementById("games");
const logoutBtn = document.getElementById("logout-button");
const settingsModal = document.getElementById("settings-modal");
const redirectToSite = document.getElementById("redirect-to-site");
const openSettingsBtn = document.getElementById("settings-button");

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
	localStorage.removeItem('steamId');
	localStorage.removeItem('apiKey');
	displayError(`An Error occured, please try to login again <br/> ${msg} <br/> Redirecting in ${delay / 1000} seconds...`, true);
	setTimeout(() => window.location.replace(redirect), delay);
};

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
	return data.response.games;
}

async function fetchAppDetails(appId) {
	const url = `${PROXY_URL}https://store.steampowered.com/api/appdetails?appids=${appId}`;
	const data = await fetchJson(url);
	return data?.[appId]?.data || {};
}

async function fetchUserDetails() {
	try {
		const url = `${PROXY_URL}https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamUserId}`;
		const data = await fetchJson(url);

		const player = data?.response?.players?.[0];
		if (!player) throw new Error("Player not found.");

		return {
			id: player.steamid,
			name: player.personaname,
			avatarSmall: player.avatar,
			avatarMedium: player.avatarmedium,
			avatarFull: player.avatarfull,
			profileUrl: player.profileurl,
			country: player.loccountrycode || "Unknown",
			lastOnline: player.lastlogoff
				? new Date(player.lastlogoff * 1000).toLocaleString()
				: "Never",
			joinedAt: player.timecreated
				? new Date(player.timecreated * 1000).toLocaleDateString()
				: "Unknown",
			visibility: player.communityvisibilitystate === 3 ? "Public" : "Private",
		} || {};
	} catch (err) {
		throw err;
	}
}

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
		menu.style.left = `${x}px`;
		menu.style.top = `${y}px`;
		menu.style.display = "block";

		const rect = menu.getBoundingClientRect();
		if (rect.right > window.innerWidth) {
			menu.style.left = `${window.innerWidth - rect.width - 10}px`;
		}

		if (rect.bottom > window.innerHeight) {
			menu.style.top = `${window.innerHeight - rect.height - 10}px`;
		}

		document.body.appendChild(menuBackdrop);
		document.body.appendChild(menu);
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

	const show = async () => {
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

	card.addEventListener("mouseenter", () => {
		clearTimeout(delayIn);
		clearTimeout(delayOut);
		delayIn = setTimeout(() => card.matches(":hover") && show(), 200);
	});

	const scheduleRemove = () => {
		clearTimeout(delayIn);
		delayOut = setTimeout(clear, 200);

		window.removeEventListener("contextmenu", scheduleRemove);
		window.removeEventListener("mouseleave", scheduleRemove);
		window.removeEventListener("blur", scheduleRemove);
	};

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
	card.role = "link";
	card.className = "game-card";
	card.onclick = () => {
		// Todo
		if (redirectToSite.checked) {
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

	if (rankedIds.includes(game.appid)) {
		const rank = rankedIds.indexOf(game.appid) + 1;
		const badge = document.createElement("div");
		badge.className = `badge rank-${rank}`;
		badge.innerText = rank;
		card.appendChild(badge);
	}

	card.append(coverImg, shard);
	setupGamePopoutTrigger(card, game, index);
	setupGameMenuTrigger(card, game);

	return card;
}

function renderGames(games, sortType) {
	try {
		let sorted = [...games];
		switch (sortType) {
			case "name": sorted = sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
			case "recent": sorted = sorted.sort((a, b) => b.rtime_last_played - a.rtime_last_played); break;
			default: sorted = sorted.sort((a, b) => b.playtime_forever - a.playtime_forever);
		}

		const topIds = sorted.slice(0, 3).map(g => g.appid);
		gamesContainer.innerHTML = "";
		sorted.forEach((game, rank) => gamesContainer.appendChild(createGameCard(game, rank, topIds)));
	} catch (e) {
		displayError("Render error: " + e.message);
	}
}

async function renderUserDetails() {
	const {
		avatarMedium,
		name,
		id
	} = await fetchUserDetails();

	const userAvatar = document.getElementById("user-avatar");
	userAvatar.src = avatarMedium;
	userAvatar.onerror = () => {
		userAvatar.src = "defaultuserimage.png";
	}

	const userName = document.getElementById("user-name");
	userName.innerText = name || "Unknown User";

	const userId = document.getElementById("user-id");
	userId.innerText = id || "Unknown ID";
}

async function loadAndRender() {
	showLoading();
	errorScreen.setAttribute("hidden", "true");
	try {
		const games = await fetchOwnedGames();
		if (!games.length) return clearSessionAndRedirect("No games found.");
		renderGames(games);
		renderUserDetails();


		// TODO: Improve later
		const isMobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent);
		redirectToSite.checked = isMobile;
	} catch (e) {
		if (/missing|invalid/i.test(e.message))
			clearSessionAndRedirect("Invalid Steam ID or API Key. Please log in again.")
		else
			displayError("Load error: " + e.message);
	} finally {
		hideLoading();
	}
}

logoutBtn.onclick = () => clearSessionAndRedirect("Logging out...", "login.html", 500);
openSettingsBtn.onclick = () => {
	settingsModal.removeAttribute("hidden");
}

loadAndRender();