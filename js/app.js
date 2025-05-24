// Development
import { storage } from "./storageManager.js";
import { network } from "./networkManager.js";
import { renderer } from "./renderManager.js";

(() => {
	let steamApiKey = storage.get("steamApiKey");
	let steamUserId = storage.get("steamId");

	// #region DOM Elements
	const loadingScreen = renderer.$("loading-screen");
	const errorScreen = renderer.$("error-screen");
	const gamesContainer = renderer.$("library");
	const logoutBtn = renderer.$("logout-button");
	const settingsModal = renderer.$("settings-modal");
	const openSettingsBtn = renderer.$("settings-button");
	const closeSettingsBtn = renderer.$("close-settings");
	const settingsModalBackdrop = renderer.$("settings-modal-backdrop");
	// #endregion DOM Elements

	// #region UI Functions
	const showLoading = () => loadingScreen.hidden = false;
	const hideLoading = () => loadingScreen.hidden = true;
	const showError = (message, isFatal = true) => {
		const errorScreenMsg = renderer.$("error-screen-message");
		errorScreenMsg.textContent = "";

		const header = document.createElement("p");
		header.innerHTML = `
		<strong>${isFatal ? "A fatal error occurred!" : "An error occurred!"}</strong><br/><br/>
		${message}<br/><br/>
		${isFatal ? "You may need to log in again." : "You can try refreshing the page."}`;

		const loginBtn = document.createElement("a");
		loginBtn.textContent = "Log in again";
		loginBtn.onclick = () => clearDataLogout();

		const refreshBtn = document.createElement("a");
		refreshBtn.textContent = "Refresh page";
		refreshBtn.onclick = () => location.reload();

		const errorActions = document.createElement("div");
		errorActions.className = "error-actions";
		errorActions.append(loginBtn, refreshBtn);

		errorScreenMsg.append(header, errorActions);

		errorScreen.hidden = false;
		hideLoading();
	};

	const clearDataLogout = (msg = "Session expired. Logging out...", noErr) => {
		const delay = 3000;

		if (!noErr) {
			console.warn(msg);
			showError(`Redirecting to login in ${delay / 1000} seconds...`, true);
		}

		storage.clear();
		setTimeout(() => window.location.replace("login.html"), delay);
	};


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
			const {
				playtime_forever,
				rtime_last_played,
				playtime_2weeks,
				appid
			} = game;

			const {
				header_image,
				screenshots
			} = await network.fetchAppDetails(appid);

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
        <div>Total: ${totalHoursPlayed + "hrs"} | ${playtime_forever + "min"}</div>
        <div>Last two weeks: ${recentPlayMinutes} min</div>
        <div>Last played: ${lastPlayedDate ? lastPlayedDate : "Unknown"}</div>
        <div>${storage.get("sortType") ? (storage.get("sortType")[0].toUpperCase() + storage.get("sortType").slice(1)) : "Sort Type"} ranking: ${(rankIndex + 1) ? "#" + (rankIndex + 1) : "Unknown"}</div>
    </div>
</div>`;
			document.body.appendChild(popout);
			renderer.clampElmToParent(card, popout);
			popout.classList.add("show");
			if (screenshots?.length) startCarousel(screenshots);
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

	function createGameCard(gameData, index, rankedIds) {
		const gameCard = document.createElement("section");
		gameCard.className = "game-card";
		gameCard.setAttribute("role", "link");
		gameCard.onclick = () => {
			// TODO
			if (storage.get("redirectToSite")) {
				window.open(`https://store.steampowered.com/app/${gameData.appid}`, "_blank");
			} else {
				window.open(`steam://rungameid/${gameData.appid}`, "_blank");
			}
		}

		const coverImg = new Image();
		coverImg.className = "cover-image";
		coverImg.alt = gameData.name || `${gameData.name} cover image`;

		const fallbackImages = [
			`https://steamcdn-a.akamaihd.net/steam/apps/${gameData.appid}/library_600x900_2x.jpg`,
			`https://shared.steamstatic.com/store_item_assets/steam/apps/${gameData.appid}/library_600x900.jpg`,
			`https://shared.steamstatic.com/store_item_assets/steam/apps/${gameData.appid}/portrait.png`
		];

		let fallbackIndex = 0;
		coverImg.onerror = () => {
			if (fallbackIndex < fallbackImages.length - 1) {
				coverImg.src = fallbackImages[++fallbackIndex];
			} else {
				coverImg.src = "img/defaultappimage.png";

				const fallbackText = document.createElement("div");
				fallbackText.className = "fallback-text";
				fallbackText.textContent = gameData.name || "Unknown Game";
				gameCard.appendChild(fallbackText);
			}
		};

		// Lazy load setup for bad internet
		if (storage.get("badInterwebs") === true) {
			coverImg.loading = "lazy";
			coverImg.dataset.src = fallbackImages[0];
			gameCard.style.cssText = "visibility: hidden; opacity: 0; transition: opacity 2s ease-in-out;";

			const observer = new IntersectionObserver((entries, obs) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const img = entry.target;
						img.src = img.dataset.src;
						gameCard.style.cssText = "visibility: visible; opacity: 1;";

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
			if (rankedIds.includes(gameData.appid)) {
				const rank = rankedIds.indexOf(gameData.appid) + 1;
				const badge = document.createElement("div");
				badge.className = `game-rank-badge rank-${rank}`;
				badge.innerText = rank;
				gameCard.prepend(badge);
			}
		}

		// functionality triggers
		setupGamePopoutTrigger(gameCard, gameData, index);

		// THOS IS THE ERRORING CODE ILL FIX IT G
		renderer.registerCtxMenuHandler(gameCard, [
			{ type: "link", label: "Play", url: `steam://rungameid/${gameData.appid}` },
			{ type: "link", label: "View on Steam", url: `https://store.steampowered.com/app/${gameData.appid}` },
			{ type: "link", label: "View News", url: `https://store.steampowered.com/app/${gameData.appid}/news/` },
			{ type: "link", label: "View Screenshots", url: `https://store.steampowered.com/app/${gameData.appid}/screenshots/` },
			{ type: "link", label: "View Videos", url: `https://store.steampowered.com/app/${gameData.appid}/videos/` }
		]);

		return gameCard;
	}

	function sortAndRankThenRenderGames(gamesList) {
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

		const filterableGameElements = gamesList.map((game, rank) => {
			const gameCard = createGameCard(game, rank, topIds);
			gamesContainer.appendChild(gameCard);
			return {
				element: gameCard,
				name: game.name.toLowerCase()
			};
		});

		function registerSearchInput() {
			const searchInpt = renderer.$("game-search");

			const filterGames = () => {
				const filterString = searchInpt.value.trim().toLowerCase();

				filterableGameElements.forEach(({ element, name }) => {
					const matches = !filterString || name.includes(filterString);
					element.style.visibility = matches ? "visible" : "hidden";
					element.style.display = matches ? "block" : "none";
				});
			};

			searchInpt.addEventListener("input", filterGames);
		}

		registerSearchInput();
	}

	async function renderUserDetails() {
		const userAvatar = renderer.$("account-avatar");
		const userName = renderer.$("account-name");
		const userId = renderer.$("account-id");

		const { avatarmedium, personaname, steamid } = await network.fetchUserDetails(steamUserId, steamApiKey);

		userAvatar.src = avatarmedium || "img/defaultuserimage.png";
		userAvatar.onerror = () => {
			userAvatar.src = "img/defaultuserimage.png";
		};

		userName.innerText = personaname || "Unknown User";
		userId.innerText = steamid || "Unknown ID";
	}

	function renderAppSettings() {
		const dynamicZettings = {
			renderingSettings: {
				type: "divider",
				label: "Render Settings"
			},
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
			includeFreeGames: {
				label: "Display free games",
				value: true,
				type: "checkbox"
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
			},
			loginDetailsArea: {
				type: "divider",
				label: "Login Details"
			},
			steamId: {
				label: "Steam ID",
				value: steamUserId,
				type: "text"
			},
			steamApiKey: {
				label: "Steam API Key",
				value: steamApiKey,
				type: "text"
			}
		};

		const container = renderer.$("settings-container");
		const saveSettingsBtn = renderer.$("save-settings");
		const resetSettingsBtn = renderer.$("reset-settings");

		// Load values
		const savedSettings = storage.getAll();

		// Initialize settings state from saved or default values
		for (const key in dynamicZettings) {
			const savedVal = savedSettings[key];
			storage.set(key, savedVal !== undefined ? savedVal : dynamicZettings[key].value);
		}

		// Render settings inputs
		Object.entries(dynamicZettings).forEach(([key, { label, value, type: elementType, options }]) => {
			const formGroup = document.createElement("div");
			formGroup.className = "settings-modal-group";

			if (elementType !== "divider") {
				const inputLabel = document.createElement("label");
				inputLabel.setAttribute("for", key);
				inputLabel.innerText = label;
				formGroup.appendChild(inputLabel);
			}

			let settingsInput;

			switch (elementType) {
				case "select":
					settingsInput = document.createElement("select");
					settingsInput.innerHTML = options.map(opt =>
						`<option value="${opt.value}" ${opt.value === storage.get(key) ? "selected" : ""}>${opt.label}</option>`
					).join("");
					break;
				case "divider":
					settingsInput = document.createElement("div");
					settingsInput.innerHTML = label;
					break;
				case "checkbox":
					settingsInput = document.createElement("input");
					settingsInput.type = "checkbox";

					if (storage.get(key) === true)
						settingsInput.checked = true
					break;
				case "text":
					settingsInput = document.createElement("input");
					settingsInput.type = "text";
					settingsInput.value = storage.get(key) ?? value;
					break;
				default:
					settingsInput = document.createElement("a");
					break;
			}

			settingsInput.id = key;

			if (settingsInput.type === "checkbox") {
				settingsInput.addEventListener("change", () => storage.set(key, settingsInput.checked));
				formGroup.classList.add("sameline");
				formGroup.prepend(settingsInput);
			} else {
				settingsInput.addEventListener("change", () => storage.set(key, settingsInput.value));
				formGroup.appendChild(settingsInput);
			}

			if (elementType) {
				settingsInput.classList.add("settings-" + elementType)
			}

			container.appendChild(formGroup);
		});

		// Save current settings
		saveSettingsBtn.addEventListener("click", () => {
			const settings = Object.keys(dynamicZettings).reduce((acc, key) => {
				acc[key] = storage.get(key);
				return acc;
			}, {});

			storage.setAll(settings);
			settingsModal.hidden = true;

			// Reload the page to apply changes
			//
			//
			// Todo replace with a better way to apply changes
			location.reload();
			//
			//
			//
		});

		// Reset to default settings
		resetSettingsBtn.addEventListener("click", () => {
			Object.entries(dynamicZettings).forEach(([key, { value }]) => {
				storage.set(key, value);
				const input = container.querySelector(`#${key}`);
				if (input) {
					if (input.type === "checkbox") {
						input.checked = value;
					} else {
						input.value = value;
					}
				}
			});
			// Reload the page to apply changes
			//
			//
			// Todo replace with a better way to apply changes
			location.reload();
			//
			//
			//
		});

		// Close listeners
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && !settingsModal.hidden) settingsModal.hidden = true;
		});
		settingsModalBackdrop.addEventListener("click", () => settingsModal.hidden = true);
		[openSettingsBtn, closeSettingsBtn].forEach(btn =>
			btn.addEventListener("click", () => settingsModal.hidden = true)
		);

		// Open settings
		openSettingsBtn.addEventListener("click", () => settingsModal.removeAttribute("hidden"));
	}
	// #endregion UI Functions

	// #region INIT
	async function loadAndRender() {
		showLoading();

		try {
			const games = await network.fetchOwnedGames(
				steamUserId,
				steamApiKey,
				storage.get("includeFreeGames")
			);
			console.log(games)

			renderAppSettings();
			sortAndRankThenRenderGames(games);
			renderUserDetails();
		} catch (e) {
			if (/missing|invalid/i.test(e.message))
				showError("Invalid Steam ID or API Key. Please refresh the page or log in again.")
			else
				showError("Load error: " + e.message);
		} finally {
			hideLoading();
		}
	}

	logoutBtn.addEventListener("click", () => clearDataLogout("Logging out...", true));


	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", loadAndRender);
	} else {
		loadAndRender();
	}
	// #endregion INIT
})();