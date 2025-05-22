import { storage } from "./storageManager.js";

(() => {
	const PROXY_URL = "https://corsproxy.io/?";
	const $ = (id) => document.getElementById(id);
	const loginForm = $("login-form");
	const steamIdInput = $("accountId");
	const apiKeyInput = $("apiKey");
	const errorDisplay = $("error-display");
	const autoFillCheckbox = $("auto-fill");
	const autoLoginCheckbox = $("auto-login");
	const submitButton = $("submit");

	const isValidSteamId = (id) => /^[0-9]{17}$/.test(id);
	const isValidApiKey = (key) => /^[A-F0-9]{32}$/i.test(key);

	const showError = (msg) => {
		errorDisplay.textContent = msg;
		loginForm.classList.add("login-error");
	};

	const clearError = () => {
		errorDisplay.textContent = "";
		loginForm.classList.remove("login-error");
	};

	const disableSubmit = () => {
		let seconds = 3;
		const inputs = [submitButton, steamIdInput, apiKeyInput];
		inputs.forEach(el => el.disabled = true);

		const countdown = () => {
			if (seconds <= 0) {
				inputs.forEach(el => el.disabled = false);
				submitButton.textContent = "Sign In";
			} else {
				submitButton.textContent = `Please wait... (${seconds--}s)`;
				setTimeout(countdown, 1000);
			}
		};

		countdown();
	};

	const validateAndRedirect = async (steamId, steamApiKey) => {
		if (!steamId || !steamApiKey) throw new Error("Missing credentials");
		if (!isValidSteamId(steamId)) throw new Error("Invalid Steam ID (17 digits required)");
		if (!isValidApiKey(steamApiKey)) throw new Error("Invalid API Key (32-char hex)");

		const url = `${PROXY_URL}https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamId}`;

		try {
			const res = await fetch(url);
			if (!res.ok) {
				const messages = {
					401: "❌ Unauthorized: Invalid API Key.",
					403: "🚫 Forbidden: No permission.",
					429: "⏱ Rate limited. Try again later.",
				};
				showError(messages[res.status] || `⚠️ Steam API error: ${res.status}`);
				return false;
			}

			const data = await res.json();
			const games = data?.response?.games;

			if (!games || !Array.isArray(games)) {
				showError("❗ No games found or invalid Steam ID.");
				return false;
			}

			window.location.replace("app.html");
			return true;
		} catch (err) {
			showError(`💥 Network error: ${err.message}`);
			return false;
		}
	};

	// Prefill from storage
	if (storage.get("autoFill") === "true") {
		steamIdInput.value = storage.get("steamId") || "";
		apiKeyInput.value = storage.get("steamApiKey") || "";
		autoFillCheckbox.checked = true;
	}

	if (storage.get("autoLogin") === "true") {
		autoLoginCheckbox.checked = true;
		disableSubmit();
		validateAndRedirect(storage.get("steamId") || "", storage.get("steamApiKey") || "");
	}

	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		if (submitButton.disabled) return;

		clearError();
		disableSubmit();

		const steamId = steamIdInput.value.trim();
		const apiKey = apiKeyInput.value.trim();

		if (!isValidSteamId(steamId)) return showError("Steam ID must be a 17-digit number.");
		if (!isValidApiKey(apiKey)) return showError("API Key must be a 32-character hex string.");

		const success = await validateAndRedirect(steamId, apiKey);
		if (!success) return;

		autoFillCheckbox.checked
			? (storage.set("autoFill", "true"), storage.set("steamId", steamId), storage.set("steamApiKey", apiKey))
			: ["autoFill", "steamId", "steamApiKey"].forEach(k => storage.remove(k));

		autoLoginCheckbox.checked
			? storage.set("autoLogin", "true")
			: storage.remove("autoLogin");
	});

	[steamIdInput, apiKeyInput].forEach(input => input.addEventListener("input", clearError));
})();