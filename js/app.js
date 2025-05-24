// app.js // development //

import { storage } from "./storageManager.js";
import { network } from "./networkManager.js";
import { renderer } from "./renderManager.js";

// IIFE for security
(() => {
	const getSteamApiKey = () => storage.get("steamApiKey");
	const getSteamUserId = () => storage.get("steamUserId");

	const dom = {
		appScreen: renderer.$("app-screen"),
		gamesContainer: renderer.$("library"),
		logoutBtn: renderer.$("logout-button"),
		settingsModal: renderer.$("settings-modal"),
		openSettingsBtn: renderer.$("settings-button"),
		closeSettingsBtn: renderer.$("close-settings"),
		settingsBackdrop: renderer.$("settings-modal-backdrop"),
		loadingScreen: renderer.$("loading-screen"),

		errorScreen: renderer.$("error-screen"),
		errorScreenActions: renderer.$("error-screen-actions"),
		errorScreenTitle: renderer.$("error-title"),
		errorMessage: renderer.$("error-screen-message"),

		searchInput: renderer.$("game-search"),
		userAvatar: renderer.$("account-avatar"),
		userName: renderer.$("account-name"),
		userId: renderer.$("account-id")
	};

	const screen = {
		showApp() {
			dom.appScreen.hidden = false
		},
		showLoading() { dom.loadingScreen.hidden = false },
		hideLoading() { dom.loadingScreen.hidden = true },
		showError(message, isFatal = true, shortMessage) {
			// TODO: Remove!! Debug!!
			setInterval(() => {
				dom.appScreen.hidden = true;
				dom.loadingScreen.hidden = true;

				if (!dom.appScreen.hidden || dom.loadingScreen.hidden)
					dom.loadingScreen.remove() && dom.appScreen.remove();
			});

			dom.appScreen.hidden = true;
			dom.loadingScreen.hidden = true;

			dom.errorScreenTitle.innerText = shortMessage || "Error";

			const defaultMsg = isFatal ? "A fatal error occurred!" : "An error occurred!";
			const recoveryMsg = isFatal ? "You may need to log in again." : "You can try refreshing the page.";
			dom.errorMessage.innerText = message || defaultMsg;
			dom.errorMessage.innerText += `\n${recoveryMsg}`;

			dom.errorScreenActions.innerHTML = "";

			const loginBtn = document.createElement("button");
			loginBtn.textContent = "Log in again";
			loginBtn.onclick = logoutWithMessage;

			const refreshBtn = document.createElement("button");
			refreshBtn.textContent = "Reload page";
			refreshBtn.onclick = () => location.reload();

			dom.errorScreenActions.append(loginBtn, refreshBtn);
			dom.errorScreen.hidden = false;
		}
	};

	const handleLaunchApp = (appid) => {
		const linkHandler = storage.get("linkHandler");

		let openUrl = `https://store.steampowered.com/app/${appid}`;
		if (linkHandler === "steam") {
			openUrl = `steam://rungameid/${appid}`;
		} else if (linkHandler === "steambrowser") {
			openUrl = `steam://openurl/${openUrl}`
		}

		window.open(openUrl, "_blank")
	}

	const gameCardManager = {
		createGameCard(game, index, rankedIds) {
			const { appid, name } = game;

			const lazyLoad = storage.get("badInterwebs") === true;
			const showBadges = storage.get("showBadges") === true;
			const disablePopouts = storage.get("disablePopouts") === true;
			const disableCtxMenus = storage.get("disableCtxMenus") === true;

			const gameCard = document.createElement("section");
			gameCard.className = "game-card";
			gameCard.setAttribute("role", "link");
			gameCard.onclick = () => {
				handleLaunchApp(appid)
			};

			// ==== Many fallbacks ====
			const coverImg = new Image();
			coverImg.className = "cover-image";
			coverImg.alt = name || "Game cover";

			const fallbackImages = [
				`https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900_2x.jpg`,
				`https://shared.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`,
				`https://shared.steamstatic.com/store_item_assets/steam/apps/${appid}/portrait.png`
			];

			let fallbackIndex = 0;
			coverImg.onerror = () => {
				if (++fallbackIndex < fallbackImages.length) {
					coverImg.src = fallbackImages[fallbackIndex];
				} else {
					coverImg.src = "img/defaultappimage.png";
					const fallbackText = document.createElement("div");
					fallbackText.className = "fallback-text";
					fallbackText.textContent = name || "Unknown Game";
					gameCard.appendChild(fallbackText);
				}
			};

			if (lazyLoad) {
				coverImg.loading = "lazy";
				coverImg.dataset.src = fallbackImages[0];
				gameCard.style.cssText = "visibilit y: hidden; opacity: 0; transition: opacity 2s ease-in-out;";

				new IntersectionObserver((entries, obs) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							entry.target.src = entry.target.dataset.src;
							gameCard.style.cssText = "visibility: visible; opacity: 1;";
							obs.unobserve(entry.target);
						}
					}
				}).observe(coverImg);
			} else {
				coverImg.src = fallbackImages[0];
			}

			gameCard.appendChild(coverImg);

			if (showBadges && rankedIds.includes(appid)) {
				const rank = rankedIds.indexOf(appid) + 1;
				const badge = document.createElement("div");
				badge.className = `game-rank-badge rank-${rank}`;
				badge.innerText = rank;
				gameCard.prepend(badge);
			}

			if (!disablePopouts)
				this.createGameCardPopout(gameCard, game, index);

			if (!disableCtxMenus)
				renderer.registerCtxMenuHandler(gameCard, [
					{
						type: "link", label: "Play", url: `steam://rungameid/${appid}`
					},
					{
						type: "link", label: "Install", url: `steam://install/${appid}`
					},
					{
						type: "link", label: "View on Steam", url: `https://store.steampowered.com/app/${appid}`
					},
					{
						type: "link", label: "View News", url: `https://store.steampowered.com/app/${appid}/news/`
					},
					{
						type: "link", label: "View Screenshots", url: `https://store.steampowered.com/app/${appid}/screenshots/`
					},
					{
						type: "link", label: "View Videos", url: `https://store.steampowered.com/app/${appid}/videos/`
					}
				]);

			return gameCard;
		},

		createGameCardPopout(card, game, rankIndex) {
			let popout = null;
			let carousel = null;
			let delayIn = null;
			let delayOut = null;

			const clearPopout = () => {
				if (carousel) {
					clearInterval(carousel);
					carousel = null;
				}
				if (popout) {
					popout.remove();
					popout = null;
				}
			};

			const rotateScreenshots = (images) => {
				if (!popout) return;
				const container = popout.querySelector(".popout-carousel");
				if (!container) return;
				let i = 0;
				container.style.backgroundImage = `url(${images[0].path_thumbnail || ""})`;
				carousel = setInterval(() => {
					i = (i + 1) % images.length;
					if (container) {
						container.style.backgroundImage = `url(${images[i].path_thumbnail || ""})`;
					}
				}, 1750);
			};

			const showPopout = async () => {
				clearPopout(); // Always start fresh

				const { appid, name, playtime_forever = 0, rtime_last_played = 0, playtime_2weeks = 0 } = game;
				const { header_image, screenshots } = await network.fetchAppDetails(appid);

				const hours = (playtime_forever / 60).toFixed(1);
				const lastPlayed = rtime_last_played
					? new Date(rtime_last_played * 1000).toLocaleDateString()
					: "Never";
				const sortType = storage.get("sortType");
				const sortLabel = sortType ? sortType[0].toUpperCase() + sortType.slice(1) : "Sort Type";
				const rank = rankIndex >= 0 ? `#${rankIndex + 1}` : "Unknown";

				popout = document.createElement("div");
				popout.className = "game-info-popout";
				popout.innerHTML = `
<div class="popout-title">${name || "Unknown Game"}</div>
<div class="popout-carousel" style="background-image: url(${header_image || ""});"></div>
<div class="popout-seperator"></div>
<div class="popout-stats-wrapper">
	<div class="popout-stats">
		<div class="popout-time-played">Time played</div>
		<div>Total: ${hours} hrs | ${playtime_forever} min</div>
		<div>Last two weeks: ${playtime_2weeks} min</div>
		<div>Last played: ${lastPlayed}</div>
		<div>${sortLabel} ranking: ${rank}</div>
	</div>
</div>`;
				document.body.appendChild(popout);
				renderer.clampElmToParent(card, popout);
				popout.classList.add("show");

				if (screenshots?.length > 0) rotateScreenshots(screenshots);
			};

			const scheduleShow = () => {
				clearTimeout(delayIn);
				clearTimeout(delayOut);
				delayIn = setTimeout(() => {
					if (card.matches(":hover")) showPopout();
				}, 200);
			};

			const scheduleRemove = () => {
				clearTimeout(delayIn);
				clearTimeout(delayOut);
				delayOut = setTimeout(clearPopout, 200);
			};

			card.addEventListener("mouseenter", scheduleShow);
			card.addEventListener("mouseleave", scheduleRemove);
			card.addEventListener("mouseout", scheduleRemove);
			window.addEventListener("contextmenu", scheduleRemove);
			window.addEventListener("mouseleave", scheduleRemove);
			window.addEventListener("blur", scheduleRemove);

			document.addEventListener("mousemove", (e) => {
				if (popout && !card.contains(e.target) && !popout.contains(e.target)) {
					clearPopout();
				}
			});
		}
	};

	const logoutWithMessage = (msg = "Session expired. Logging out...", skipError = false) => {
		console.log("Testing Testing Testing");
		storage.clear();
		setTimeout(() => location.replace("login.html"), 1000);
	};

	const renderGames = (gamesList) => {
		const hideUnplayed = storage.get("hideUnplayed") === true;
		const sortType = storage.get("sortType");

		if (hideUnplayed)
			gamesList = gamesList.filter(game => game.playtime_forever);

		const sortBy = {
			name: (a, b) => a.name.localeCompare(b.name),
			recent: (a, b) => b.rtime_last_played - a.rtime_last_played,
			playtime: (a, b) => b.playtime_forever - a.playtime_forever
		};

		gamesList.sort(sortBy[sortType] || sortBy.playtime);

		dom.gamesContainer.className = `size-${storage.get("gameSize") || "default"}`;
		dom.gamesContainer.innerHTML = "";

		const topIds = gamesList.slice(0, 3).map(g => g.appid);

		const searchMap = gamesList.map((game, i) => {
			const card = gameCardManager.createGameCard(game, i, topIds);
			dom.gamesContainer.appendChild(card);
			return { element: card, name: game.name.toLowerCase() };
		});

		dom.searchInput.addEventListener("input", () => {
			const term = dom.searchInput.value.trim().toLowerCase();
			searchMap.forEach(({ element, name }) => {
				const match = !term || name.includes(term);
				element.style.visibility = match ? "visible" : "hidden";
				element.style.display = match ? "block" : "none";
			});
		});
	};

	// Avatar, Name, ID etc.
	const fillUserDetails = async () => {
		const { avatarmedium, personaname, steamid } = await network.fetchUserDetails(getSteamUserId(), getSteamApiKey());
		dom.userAvatar.src = avatarmedium || "img/defaultuserimage.png";
		dom.userAvatar.onerror = () => (dom.userAvatar.src = "img/defaultuserimage.png");
		dom.userName.innerHTML = personaname || "Unknown User";
		dom.userId.innerHTML = steamid || "Unknown ID";
	};

	const loadCustomCss = () => {
		console.log("Loading custom CSS");
		const cssText = storage.get("customCss");
		console.log("Custom CSS: ", cssText);
		const styleElement = document.createElement("style");
		styleElement.id = "CUSTOMCSS";
		styleElement.innerHTML = cssText;
		document.head.appendChild(styleElement);

		console.log("Appended custom CSS code to head", styleElement);
	};

	const exportConfig = () => {
		const allSettings = storage.getAll();
		const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "steamdesktop-settings.json";
		a.click();

		URL.revokeObjectURL(url);
	}

	const importConfig = async () => {
		const tryOpenFile = async () => {
			return new Promise((resolve, reject) => {
				const fileElm = document.createElement("input");
				fileElm.type = "file";
				fileElm.accept = ".json";
				fileElm.click();

				fileElm.addEventListener("change", function () {
					const file = this.files?.[0];
					if (!file) return reject("No settings file selected");

					const reader = new FileReader();
					reader.onload = function (e) {
						const result = e.target?.result;
						if (typeof result !== "string") return reject("Invalid settings content");

						try {
							const parsed = JSON.parse(result);
							resolve(parsed);
						} catch {
							reject("Invalid JSON");
						}
					};

					reader.onerror = () => reject("Failed to read settings file");
					reader.readAsText(file);
				});
			});
		};

		try {
			const importedConfig = await tryOpenFile();
			if (typeof importedConfig !== "object" || importedConfig === null) {
				throw new Error("Imported config is not an object");
			}

			storage.setAll(importedConfig);
			alert("Settings imported successfully.");
			location.reload(); // Refresh to apply new settings
		} catch (err) {
			console.error("Import failed:", err);
			alert(`Failed to import settings: ${err}`);
		}
	};

	function renderAppSettings() {
		const settingsSchema = {
			gameFilters: { type: "divider", label: "Game Filters" },
			dontIncludePlayedFreeGames: { label: "Hide played free games", value: false, type: "checkbox" },
			hideUnplayed: {
				label: "Hide unplayed games",
				value: false,
				type: "checkbox"
			},
			renderingSettings: { type: "divider", label: "Render Settings" },
			disablePopouts: {
				label: "Disable Stat Popouts",
				value: false,
				type: "checkbox"
			},
			disableCtxMenus: {
				label: "Disable Right Click Menus",
				value: false,
				type: "checkbox"
			},
			showBadges: { label: "Show badges", value: true, type: "checkbox" },
			badInterwebs: { label: "Bad internet? Reduce network usage.", value: false, type: "checkbox" },
			customBehavior: {
				label: "Custom Behavior",
				type: "divider",
			},
			customCss: {
				label: "Custom CSS code (Advanced)",
				type: "textarea",
				value: `.game-card { background-color: red; }`
			},
			linkHandler: {
				label: "How to open links",
				type: "select",
				options: [
					{
						label: "Open in browser",
						value: "browser"
					},
					{
						label: "Open in steam",
						value: "steam"
					},
					{
						label: "Open in steam browser",
						value: "steambrowser"
					},
				]
			},
			loginDetailsArea: { type: "divider", label: "Login Details" },
			steamUserId: { label: "Steam ID", value: getSteamUserId(), type: "text" },
			steamApiKey: { label: "Steam API Key", value: getSteamApiKey(), type: "text" },
			importExportConfig: {
				label: "Import/Export Settings",
				type: "divider",
			},
			importConfig: {
				label: "Import Settings",
				type: "button",
				action: importConfig
			},
			exportConfig: {
				label: "Export Saved Settings",
				type: "button",
				action: exportConfig
			},
		};

		const container = renderer.$("settings-container");
		const saveBtn = renderer.$("save-settings");
		const resetBtn = renderer.$("reset-settings");

		const savedSettings = storage.getAll();

		Object.entries(settingsSchema).forEach(([key, def]) => {
			storage.set(key, savedSettings[key] !== undefined ? savedSettings[key] : def.value);
		});

		Object.entries(settingsSchema).forEach(([key, def]) => {
			const group = document.createElement("div");
			group.className = "settings-modal-group";

			let el;
			switch (def.type) {
				case "select":
					el = document.createElement("select");
					el.innerHTML = def.options.map(opt =>
						`<option value="${opt.value}" ${opt.value === storage.get(key) ? "selected" : ""}>${opt.label}</option>`
					).join("");
					break;
				case "divider":
					el = document.createElement("div");
					el.innerHTML = def.label;
					break;
				case "checkbox":
					el = document.createElement("input");
					el.type = "checkbox";
					el.checked = !!storage.get(key);
					break;
				case "text":
					el = document.createElement("input");
					el.type = "text";
					el.value = storage.get(key) ?? def.value;
					break;
				case "number":
					el = document.createElement("input");
					el.type = "number";
					el.value = storage.get(key) ?? def.value;
					break;
				case "textarea":
					el = document.createElement("textarea");
					el.value = storage.get(key) ?? `.controls-topbar { resize: vertical; overflow: hidden; }`;
					break;
				case "button":
					el = document.createElement("button");
					el.innerText = def.label;
					el.classList.add("button");

					if (def.action && typeof def.action === "function") {
						el.addEventListener("click", () => {
							def.action?.();
						});
					}

					break;
				default:
					el = document.createElement("a");
			}
			el.id = key;
			el.className = `settings-modal-item ${def.type}`;

			if (def.type !== "divider") {
				const label = document.createElement("label");
				label.setAttribute("for", key);
				label.innerText = def.label;
				group.appendChild(label);
			}

			if (el.type === "checkbox") {
				group.classList.add("sameline");
				group.prepend(el);
			} else {
				group.appendChild(el);
			}

			container.appendChild(group);
		});

		const showSettings = () => dom.settingsModal.hidden = false;
		const hideSettings = () => dom.settingsModal.hidden = true;

		saveBtn.addEventListener("click", () => {
			const settings = {};

			Object.entries(settingsSchema).forEach(([key, def]) => {
				const input = container.querySelector(`#${key}`);
				if (!input || def.type === "divider") return;

				if (input.type === "checkbox") {
					settings[key] = input.checked;
				} else if (input.tagName === "SELECT" || input.tagName === "INPUT" || input.tagName === "TEXTAREA") {
					settings[key] = input.value;
				}
			});

			storage.setAll(settings);
			dom.settingsModal.hidden = true;
			location.reload(); // TODO: Replace with live reload
		});

		resetBtn.addEventListener("click", () => {
			Object.entries(settingsSchema).forEach(([key, def]) => {
				storage.set(key, def.value);
				const input = container.querySelector(`#${key}`);
				if (input) {
					if (input.type === "checkbox") {
						input.checked = def.value;
					} else {
						input.value = def.value;
					}
				}
			});

			dom.settingsModal.hidden = true;
			location.reload(); // TODO: Replace with live reload
		});

		document.addEventListener("keydown", e => e.key === "Escape" ? hideSettings() : null)
		renderer.$("settings-modal-backdrop").addEventListener("click", hideSettings);
		dom.closeSettingsBtn.addEventListener("click", hideSettings);
		dom.openSettingsBtn.addEventListener("click", showSettings);
	}

	async function initializeApp() {
		try {
			screen.showLoading();
			const userId = getSteamUserId();
			const key = getSteamApiKey();

			if (!userId || !key) throw new Error("Missing credentials");
			const gamesList = await network.fetchOwnedGames(userId, key, storage.get("dontIncludePlayedFreeGames") === false);
			if (!gamesList.length) throw new Error("No games found for user.");

			loadCustomCss();
			renderAppSettings();
			renderGames(gamesList);
			await fillUserDetails();
			screen.hideLoading();
			screen.showApp();
		} catch (err) {
			if (/missing|invalid/i.test(err.message)) {
				screen.showError("Invalid Steam ID or API Key. Please refresh the page or log in again.")
			} else {
				let translatedText = network.translateHttpError(err);
				if (err.message) {
					screen.showError(`Initialization error: ${err.message}`);
				} else if (translatedText) {
					screen.showError(`Requesting data from Steam failed: ${translatedText}`)
				} else {
					screen.showError("Initialization Failed", err)
				}
			}
		}
	};

	// onDocumentReady
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initializeApp);
	} else {
		initializeApp();
	}

	dom.logoutBtn.addEventListener("click", () => logoutWithMessage("Logging out...", true));
})();