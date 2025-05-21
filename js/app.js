// // Constants
// const PROXY_URL = "https://corsproxy.io/?";
// const steamUserId = localStorage.getItem("steamId") || "";
// const steamApiKey = localStorage.getItem("apiKey") || "";

// // DOM Elements
// const loadingScreen = document.getElementById("loading-screen");
// const errorScreen = document.getElementById("error-screen");
// const gamesContainer = document.getElementById("games");
// const logoutBtn = document.getElementById("logout-button");
// const settingsModal = document.getElementById("settings-modal");
// const openSettingsBtn = document.getElementById("settings-button");
// // const closeSettingsBtn = document.getElementById("close-settings"); // Uncomment if needed

// // UI helpers
// const showLoading = () => loadingScreen.removeAttribute("hidden");
// const hideLoading = () => loadingScreen.setAttribute("hidden", "true");
// const displayError = (message) => {
// 	errorScreen.innerHTML = `
// <img src="icon.png" alt="Error Icon" />
// <p>${message}</p>
// <a href="javascript:location.reload()">Reload</a>`;
// 	errorScreen.removeAttribute("hidden");
// 	hideLoading();
// };



// const clearSessionAndRedirect = (message, redirectUrl = "login.html", delayMs = 3000) => {
// 	localStorage.clear();
// 	displayError(`${message} <br/> Redirecting in ${delayMs / 1000} seconds...`);
// 	setTimeout(() => window.location.replace(redirectUrl), delayMs);
// };

// // Fetch Helpers
// async function fetchJson(url) {
// 	try {
// 		const response = await fetch(url);
// 		if (!response.ok) throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
// 		return await response.json();
// 	} catch (error) {
// 		console.error("fetchJson error:", error);
// 		throw new Error(`Network or fetch error: ${error.message}`);
// 	}
// }

// // Steam API Helpers
// async function fetchOwnedGames() {
// 	if (!steamUserId || !steamApiKey) {
// 		throw new Error("Steam User ID or API Key is missing.");
// 	}

// 	const url = `${PROXY_URL}https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamUserId}&include_appinfo=1&include_played_free_games=1&format=json`;

// 	const data = await fetchJson(url);
// 	if (!data?.response) throw new Error("Invalid response from Steam API.");

// 	if (!data.response.game_count || !Array.isArray(data.response.games)) {
// 		throw new Error("No games found or invalid Steam ID.");
// 	}

// 	return data.response.games;
// }

// async function fetchAppDetails(appId) {
// 	const url = `${PROXY_URL}https://store.steampowered.com/api/appdetails?appids=${appId}`;
// 	const data = await fetchJson(url);
// 	if (!data?.[appId]?.data) {
// 		console.warn(`No details found for appId ${appId}`);
// 		return {};
// 	}
// 	return data[appId].data;
// }

// // UI: Popout Helpers
// function attachPopoutToParent(parent, popout) {
// 	const { scrollX, scrollY } = window;
// 	const parentRect = parent.getBoundingClientRect();
// 	const popoutRect = popout.getBoundingClientRect();

// 	let left = parentRect.right + scrollX + 15;
// 	let top = parentRect.top + scrollY;

// 	if (left + popoutRect.width > document.body.scrollWidth + scrollX) {
// 		left = parentRect.left - popoutRect.width + scrollX - 15;
// 	}
// 	if (top + popoutRect.height > document.body.scrollHeight + scrollY) {
// 		top = parentRect.bottom - popoutRect.height + scrollY;
// 	}

// 	popout.style.left = `${Math.max(scrollX, Math.min(left, document.body.scrollWidth - popoutRect.width + scrollX))}px`;
// 	popout.style.top = `${Math.max(scrollY, Math.min(top, document.body.scrollHeight - popoutRect.height + scrollY))}px`;

// 	return popout;
// }

// // Creates and manages the game detail popout on hover
// function setupGamePopoutTrigger(gameCard, gameDetails, rankIndex) {
// 	let activePopout = null;
// 	let showTimeout = null;
// 	let hideTimeout = null;
// 	let carouselInterval = null;

// 	const removePopout = () => {
// 		if (activePopout) {
// 			activePopout.remove();
// 			activePopout = null;
// 		}
// 		if (carouselInterval) {
// 			clearInterval(carouselInterval);
// 			carouselInterval = null;
// 		}
// 	};

// 	const startScreenshotCarousel = (screenshots) => {
// 		if (!activePopout || !screenshots.length) return;

// 		const carousel = activePopout.querySelector(".popout-carousel");
// 		let currentIndex = 0;
// 		carousel.style.backgroundImage = `url(${screenshots[0].path_thumbnail || ""})`;

// 		carouselInterval = setInterval(() => {
// 			currentIndex = (currentIndex + 1) % screenshots.length;
// 			carousel.style.backgroundImage = `url(${screenshots[currentIndex].path_thumbnail || ""})`;
// 		}, 1750);
// 	};

// 	const showPopout = async () => {
// 		try {
// 			const { appid, playtime_forever, rtime_last_played, playtime_2weeks } = gameDetails;
// 			const lastPlayedTimestamp = parseInt(rtime_last_played, 10);
// 			const recentPlayMinutes = playtime_2weeks || 0;
// 			const totalHoursPlayed = (playtime_forever / 60).toFixed(1);
// 			const lastPlayedDate = lastPlayedTimestamp
// 				? new Date(lastPlayedTimestamp * 1000).toLocaleDateString()
// 				: "Never";

// 			const { screenshots, header_image, name } = await fetchAppDetails(appid);

// 			removePopout(); // clean old if any

// 			activePopout = document.createElement("div");
// 			activePopout.className = "popout";
// 			activePopout.innerHTML = `
// <div class="popout-title">${name || "Unknown Game"}</div>
// <div class="popout-carousel" style="background-image: url(${header_image || ""});"></div>
// <div class="popout-seperator"></div>
// <div class="popout-stats-wrapper">
//     <div class="popout-stats">
//         <div class="popout-time-played">Time played</div>
//         <div>Last two weeks: ${recentPlayMinutes || "Unknown"} min</div>
//         <div>Total: ${totalHoursPlayed ? totalHoursPlayed + "hrs" : "Unknown"} | ${playtime_forever ? playtime_forever + "min" : "Unknown"}</div>
//         <div>Most played ranking: ${(rankIndex + 1) ? "#" + (rankIndex + 1) : "Unknown"}</div>
//         <div>Last played: ${lastPlayedDate ? lastPlayedDate : "Unknown"}</div>
//     </div>
// </div>`;

// 			document.body.appendChild(activePopout);
// 			attachPopoutToParent(gameCard, activePopout);
// 			activePopout.classList.add("show");

// 			if (screenshots?.length) startScreenshotCarousel(screenshots);
// 		} catch (error) {
// 			console.error("Failed to show game popout:", error);
// 		}
// 	};

// 	gameCard.addEventListener("mouseenter", () => {
// 		clearTimeout(showTimeout);
// 		clearTimeout(hideTimeout);
// 		showTimeout = setTimeout(() => {
// 			if (gameCard.matches(":hover")) showPopout();
// 		}, 200);
// 	});

// 	const schedulePopoutRemoval = () => {
// 		clearTimeout(showTimeout);
// 		hideTimeout = setTimeout(removePopout, 200);
// 	};

// 	gameCard.addEventListener("mouseleave", schedulePopoutRemoval);
// 	gameCard.addEventListener("mouseout", schedulePopoutRemoval);

// 	document.addEventListener("mousemove", (event) => {
// 		if (activePopout && !gameCard.contains(event.target) && !activePopout.contains(event.target)) {
// 			removePopout();
// 		}
// 	});
// }

// // Creates each game card element with relevant info and event handlers
// function createGameCard(game, index, topAppIds) {
// 	const card = document.createElement("div");
// 	card.className = "game-card";
// 	card.onclick = () => window.open(`steam://rungameid/${game.appid}`, "_blank");

// 	const shard = document.createElement("div");
// 	shard.className = "panel-shard";

// 	const coverImage = new Image();
// 	coverImage.className = "cover-image";
// 	coverImage.alt = game.name || "Game Cover Image";

// 	coverImage.onerror = () => {
// 		coverImage.onerror = () => {
// 			coverImage.onerror = () => {
// 				card.appendChild(document.createTextNode(game.name || "Unknown Game"));
// 			};
// 			coverImage.src = `https://shared.steamstatic.com/store_item_assets/steam/apps/${game.appid}/portrait.png`;
// 		};
// 		coverImage.src = `https://shared.steamstatic.com/store_item_assets/steam/apps/${game.appid}/library_600x900.jpg`;
// 	};

// 	coverImage.src = `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/library_600x900_2x.jpg`;

// 	if (topAppIds.includes(game.appid)) {
// 		const rank = topAppIds.indexOf(game.appid) + 1;
// 		const badge = document.createElement("div");
// 		badge.className = `badge rank-${rank}`;
// 		badge.innerText = rank;
// 		card.appendChild(badge);
// 	}

// 	card.append(coverImage, shard);
// 	setupGamePopoutTrigger(card, game, index);

// 	return card;
// }

// // Sort games based on selected criteria
// function sortGamesByCriteria(games, criteria = "playtime") {
// 	if (!Array.isArray(games) || games.length === 0) {
// 		throw new Error("Game list is empty or invalid.");
// 	}

// 	const gamesCopy = [...games];

// 	switch (criteria) {
// 		case "name":
// 			return gamesCopy.sort((a, b) => a.name.localeCompare(b.name));
// 		case "recent":
// 			return gamesCopy.sort((a, b) => b.rtime_last_played - a.rtime_last_played);
// 		case "playtime":
// 		default:
// 			return gamesCopy.sort((a, b) => b.playtime_forever - a.playtime_forever);
// 	}
// }

// // Display sorted games on the page
// function renderGames(games, sortCriteria) {
// 	try {
// 		const sortedGames = sortGamesByCriteria(games, sortCriteria);
// 		const topThreeAppIds = sortedGames.slice(0, 3).map(g => g.appid);

// 		gamesContainer.innerHTML = "";
// 		sortedGames.forEach((game, idx) => {
// 			gamesContainer.appendChild(createGameCard(game, idx, topThreeAppIds));
// 		});
// 	} catch (error) {
// 		displayError("Failed to render games: " + error.message);
// 	}
// }

// // Main entry point: Fetch and display games
// async function loadAndDisplayGames() {
// 	showLoading();
// 	errorScreen.setAttribute("hidden", "true");

// 	document.ax()
// 	try {
// 		const games = await fetchOwnedGames();
// 		if (games.length === 0) {
// 			clearSessionAndRedirect("You have no games in your Steam library.");
// 			return;
// 		}
// 		renderGames(games, "playtime");
// 	} catch (error) {
// 		if (/missing|invalid|not found|invalid steam/i.test(error.message)) {
// 			clearSessionAndRedirect("Invalid Steam ID or API Key. Please log in again.");
// 		} else {
// 			displayError("Error loading games: " + error.message);
// 		}
// 	} finally {
// 		hideLoading();
// 	}
// }

// // Attach UI event handlers
// logoutBtn.onclick = () => clearSessionAndRedirect("Logging out...", "login.html", 500);
// openSettingsBtn.onclick = () => settingsModal.removeAttribute("hidden");
// // closeSettingsBtn.onclick = () => settingsModal.setAttribute("hidden", "true"); // Uncomment if needed

// // Kick off loading
// loadAndDisplayGames();


const PROXY_URL = "https://corsproxy.io/?";
const steamUserId = localStorage.getItem("steamId") || "";
const steamApiKey = localStorage.getItem("apiKey") || "";

const loadingScreen = document.getElementById("loading-screen");
const errorScreen = document.getElementById("error-screen");
const gamesContainer = document.getElementById("games");
const logoutBtn = document.getElementById("logout-button");
const settingsModal = document.getElementById("settings-modal");
const openSettingsBtn = document.getElementById("settings-button");

const showLoading = () => loadingScreen.removeAttribute("hidden");
const hideLoading = () => loadingScreen.setAttribute("hidden", "true");
const displayError = (msg, isFatal = false) => {
    errorScreen.innerHTML = `
        <img src="icon.png" alt="Error Icon" />
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
    displayError(`${msg} <br/> Redirecting in ${delay / 1000} seconds...`, true);
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

function attachPopoutToParent(parent, popout) {
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
				header_image,
				screenshots
			} = await fetchAppDetails(game.appid);

			const lastPlayedTimestamp = parseInt(rtime_last_played, 10);
			const recentPlayMinutes = playtime_2weeks || 0;
			const totalHoursPlayed = (playtime_forever / 60).toFixed(1);
			const lastPlayedDate = lastPlayedTimestamp
				? new Date(lastPlayedTimestamp * 1000).toLocaleDateString()
				: "Never";

			// const { screenshots, header_image, name } = await fetchAppDetails(appid);

			popout = document.createElement("div");
			popout.className = "popout";
			popout.innerHTML = `
<div class="popout-title">${game.name || "Unknown Game"}</div>
<div class="popout-carousel" style="background-image: url(${header_image || ""});"></div>
<div class="popout-seperator"></div>
<div class="popout-stats-wrapper">
    <div class="popout-stats">
        <div class="popout-time-played">Time played</div>
        <div>Last two weeks: ${recentPlayMinutes || "Unknown"} min</div>
        <div>Total: ${totalHoursPlayed ? totalHoursPlayed + "hrs" : "Unknown"} | ${playtime_forever ? playtime_forever + "min" : "Unknown"}</div>
        <div>Most played ranking: ${(rankIndex + 1) ? "#" + (rankIndex + 1) : "Unknown"}</div>
        <div>Last played: ${lastPlayedDate ? lastPlayedDate : "Unknown"}</div>
    </div>
</div>`;
			document.body.appendChild(popout);
			attachPopoutToParent(card, popout);
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


function createGameCard(game, rankedIds) {
    const card = document.createElement("section");
    card.role = "link";
    card.className = "game-card";
    card.onclick = () => window.open(`steam://rungameid/${game.appid}`, "_blank");

    const shard = document.createElement("div");
    shard.className = "panel-shard";

    const imgContainer = document.createElement("div");
    imgContainer.className = "image-container";

    const img = new Image();
    img.className = "cover-image";
    img.alt = game.name || "Game Cover";

    const fallbackImages = [
        `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/library_600x900_2x.jpg`,
        `https://shared.steamstatic.com/store_item_assets/steam/apps/${game.appid}/library_600x900.jpg`,
        `https://shared.steamstatic.com/store_item_assets/steam/apps/${game.appid}/portrait.png`,
        "img/defaultappimage.png"
    ];

    let fallbackIndex = 0;
    img.onerror = () => {
        if (fallbackIndex < fallbackImages.length - 1) {
            img.src = fallbackImages[++fallbackIndex];
        } else {
            img.style.display = "none";
            const fallbackText = document.createElement('div');
            fallbackText.className = "fallback-text";
            fallbackText.textContent = game.name || "Unknown Game";
            imgContainer.appendChild(fallbackText);
        }
    };

    img.src = fallbackImages[0];
    imgContainer.appendChild(img);

    if (rankedIds.includes(game.appid)) {
        const rank = rankedIds.indexOf(game.appid) + 1;
        const badge = document.createElement("div");
        badge.className = `badge rank-${rank}`;
        badge.innerText = rank;
        card.appendChild(badge);
    }

    card.append(imgContainer, shard);
    setupGamePopoutTrigger(card, game, rankedIds.indexOf(game.appid));

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
		sorted.forEach((g) => gamesContainer.appendChild(createGameCard(g, topIds)));
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

loadAndRender();