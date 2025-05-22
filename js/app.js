import { storage } from "./storageManager.js";

(() => {
	// Development
	// TODO: proxy stuff
	const PROXY_URL = "https://corsproxy.io/?";
	const steamUserId = storage.get("steamId");
	const steamApiKey = storage.get("apiKey");

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
		storage.clear();
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

	function setupGameCtxMenuTrigger(gameCard, gameData, creationData = []) {
		const ctxMenuBackdrop = document.createElement("div");
		ctxMenuBackdrop.className = "context-menu-backdrop";

		const ctxMenu = document.createElement("div");
		ctxMenu.className = "context-menu";

		creationData = Object.assign(creationData, [
			{ label: "Play", url: `steam://rungameid/${gameData.appid}` },
			{ label: "View on Steam", url: `https://store.steampowered.com/app/${gameData.appid}` },
			{ label: "View News", url: `https://store.steampowered.com/app/${gameData.appid}/news/` },
			{ label: "View Screenshots", url: `https://store.steampowered.com/app/${gameData.appid}/screenshots/` },
			{ label: "View Videos", url: `https://store.steampowered.com/app/${gameData.appid}/videos/` },
		]);

		creationData.forEach(({ label, url }) => {
			const item = document.createElement("div");
			item.className = "context-menu-item";
			item.textContent = label;

			item.addEventListener("click", () => {
				window.open(url, "_blank");
				hideMenu();
			});

			ctxMenu.appendChild(item);
		});

		const showMenu = () => {
			document.body.append(ctxMenuBackdrop, ctxMenu);
			attachFloaterToParent(gameCard, ctxMenu);
		};

		const hideMenu = () => {
			ctxMenu.remove();
			ctxMenuBackdrop.remove();
		};

		gameCard.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			showMenu();
		});

		document.addEventListener("click", (e) => {
			if (!ctxMenu.contains(e.target)) {
				hideMenu();
			}
		});

		ctxMenuBackdrop.addEventListener("click", () => {
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
				popout.className = "game-info-popout";
				popout.innerHTML = `
<div class="popout-title">${game.name || "Unknown Game"}</div>
<div class="popout-carousel" style="background-image: url(${header_image || ""});"></div>
<div class="popout-seperator"></div>
<div class="popout-stats-wrapper">
    <div class="popout-stats">
        <div class="popout-time-played">Time played</div>
        <div>Last two weeks: ${recentPlayMinutes} min</div>
        <div>Total: ${totalHoursPlayed ? totalHoursPlayed + "hrs" : "Unknown"} | ${playtime_forever ? playtime_forever + "min" : "Unknown"}</div>
        <div>${storage.get("sortType") ? (storage.get("sortType")[0].toUpperCase() + storage.get("sortType").slice(1)) : "Sort Type"} ranking: ${(rankIndex + 1) ? "#" + (rankIndex + 1) : "Unknown"}</div>
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
		const gameCard = document.createElement("section");
		gameCard.className = "game-card";
		gameCard.setAttribute("role", "link");
		gameCard.onclick = () => {
			// TODO
			if (storage.get("redirectToSite")) {
				window.open(`https://store.steampowered.com/app/${game.appid}`, "_blank");
			} else {
				window.open(`steam://rungameid/${game.appid}`, "_blank");
			}
		}

		const coverImg = new Image();
		coverImg.className = "cover-image";
		coverImg.alt = game.name || `${game.name} cover image`;

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
				gameCard.appendChild(fallbackText);
			}
		};

		// Lazy load setup for bad internet
		if (storage.get("badInterwebs") === true) {
			coverImg.loading = "lazy";
			coverImg.dataset.src = fallbackImages[0];

			const observer = new IntersectionObserver((entries, obs) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const img = entry.target;
						img.src = img.dataset.src;
						obs.unobserve(img);
					}
				});
			});

			observer.observe(coverImg);
		} else {
			coverImg.src = fallbackImages[0];
		}

		gameCard.appendChild(coverImg);

		// Show badges if enabled
		if (storage.get("showBadges") === true) {
			if (rankedIds.includes(game.appid)) {
				const rank = rankedIds.indexOf(game.appid) + 1;
				const badge = document.createElement("div");
				badge.className = `game-rank-badge rank-${rank}`;
				badge.innerText = rank;
				gameCard.prepend(badge);
			}
		}

		// functionality triggers
		setupGamePopoutTrigger(gameCard, game, index);
		setupGameCtxMenuTrigger(gameCard, game);

		return gameCard;
	}

	function sortAndRankThenRenderGames(gamesList) {
		try {
			switch (storage.get("sortType")) {
				case "name":
					gamesList.sort((a, b) => a.name.localeCompare(b.name));
					break;
				case "recent":
					gamesList.sort((a, b) => b.rtime_last_played - a.rtime_last_played);
					break;
				default:
					gamesList.sort((a, b) => b.playtime_forever - a.playtime_forever);
			}

			const topIds = gamesList.slice(0, 3).map(g => g.appid);

			// clear games container
			gamesContainer.innerHTML = "";

			gamesList.forEach((game, rank) =>
				gamesContainer.appendChild(createGameCard(game, rank, topIds))
			);
		} catch (e) {
			displayError("Render error: " + e.message);
		}
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

	function renderAppSettings() {
		const dynamicZettings = {
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
		const saveSettingsBtn = $("save-settings");
		const resetSettingsBtn = $("reset-settings");

		// Load values
		const savedSettings = storage.getAll();

		// Initialize settings state from saved or default values
		for (const key in dynamicZettings) {
			const savedVal = savedSettings[key];
			storage.set(key, savedVal !== undefined ? savedVal : dynamicZettings[key].value);
		}

		// Render settings inputs
		Object.entries(dynamicZettings).forEach(([key, { label, value, type, options }]) => {
			const formGroup = document.createElement("div");
			formGroup.className = "settings-modal-group";

			const inputLabel = document.createElement("label");
			inputLabel.setAttribute("for", key);
			inputLabel.innerText = label;
			formGroup.appendChild(inputLabel);

			let settingsInput;

			if (type === "select") {
				settingsInput = document.createElement("select");
				settingsInput.innerHTML = options.map(opt =>
					`<option value="${opt.value}" ${opt.value === storage.get(key) ? "selected" : ""}>${opt.label}</option>`
				).join("");
			} else if (type === "checkbox") {
				settingsInput = document.createElement("input");
				settingsInput.type = "checkbox";
				settingsInput.checked = storage.get(key) || value || "";
			} else {
				settingsInput = document.createElement("input");
				settingsInput.type = "text";
				settingsInput.value = storage.get(key) || value || "";
			}

			settingsInput.id = key;

			if (settingsInput.type === "checkbox") {
				settingsInput.addEventListener("change", () => storage.set(key, settingsInput?.checked || null));
				// checkbox before label
				formGroup.classList.add("sameline");
				formGroup.prepend(settingsInput);
			} else {
				settingsInput.addEventListener("change", () => storage.set(key, settingsInput?.value));
				// c
				formGroup.appendChild(settingsInput);
			}

			container.appendChild(formGroup);
		});

		// close listeners
		document.addEventListener("keydown", (e) => settingsModal.hidden = (e.key === "Escape" && !settingsModal.hidden));
		settingsModalBackdrop.addEventListener("click", () => settingsModal.hidden = true);

		[openSettingsBtn, closeSettingsBtn].forEach(btn =>
			btn.addEventListener("click", () => settingsModal.hidden = true)
		);

		// open listeners
		openSettingsBtn.addEventListener("click", () => settingsModal.removeAttribute("hidden"));
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
			renderAppSettings();
			sortAndRankThenRenderGames(games);
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
})()