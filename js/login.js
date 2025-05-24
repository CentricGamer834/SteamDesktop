import { storage } from "./storageManager.js";
import { network } from "./networkManager.js";
import { renderer } from "./renderManager.js";

(() => {
	const loginForm = renderer.$("login-form"),
		steamUserIdInput = renderer.$("accountId"),
		apiKeyInput = renderer.$("apiKey"),
		errorDisplay = renderer.$("error-display"),
		autoFillCheckbox = renderer.$("auto-fill"),
		autoLoginCheckbox = renderer.$("auto-login"),
		submitButton = renderer.$("login");

	const isValidsteamUserId = (id) => /^[0-9]{17}$/.test(id);
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
		const inputs = [submitButton, steamUserIdInput, apiKeyInput];
		inputs.forEach((el) => (el.disabled = true));

		const countdown = () => {
			if (seconds <= 0) {
				inputs.forEach((el) => (el.disabled = false));
				submitButton.textContent = "Sign In";
			} else {
				submitButton.textContent = `Please wait... (${seconds--}s)`;
				setTimeout(countdown, 1000);
			}
		};

		countdown();
	};

	const validateAndRedirect = async (steamUserId, steamApiKey) => {
		if (!steamUserId || !steamApiKey) throw new Error("Missing credentials");
		if (!isValidsteamUserId(steamUserId)) throw new Error("Invalid Steam ID (17 digits required)");
		if (!isValidApiKey(steamApiKey)) throw new Error("Invalid API Key (32-char hex)");

		try {
			await network.fetchOwnedGames(steamUserId, steamApiKey, false, false);
			window.location.replace("app.html");
			return true;
		} catch (err) {
			showError(network.translateHttpError(err));
			return false;
		}
	};

	// Prefill from storage
	if (storage.get("autoFill") === true) {
		steamUserIdInput.value = storage.get("steamUserId") || "";
		apiKeyInput.value = storage.get("steamApiKey") || "";
		autoFillCheckbox.checked = true;
	}

	if (storage.get("autoLogin") === true) {
		autoLoginCheckbox.checked = true;
		disableSubmit();
		validateAndRedirect(storage.get("steamUserId") || "", storage.get("steamApiKey") || "");
	}

	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		if (submitButton.disabled) return;

		clearError();
		disableSubmit();

		const steamUserId = steamUserIdInput.value.trim();
		const apiKey = apiKeyInput.value.trim();

		if (!isValidsteamUserId(steamUserId)) {
			showError("Steam ID must be a 17-digit number.");
			return;
		}

		if (!isValidApiKey(apiKey)) {
			showError("API Key must be a 32-character hex string.");
			return;
		}

		const success = await validateAndRedirect(steamUserId, apiKey);
		if (!success) return;

		if (autoFillCheckbox.checked) {
			storage.set("autoFill", true);
			storage.set("steamUserId", steamUserId);
			storage.set("steamApiKey", apiKey);
		} else {
			["autoFill", "steamUserId", "steamApiKey"].forEach((k) => storage.remove(k));
		}

		if (autoLoginCheckbox.checked) {
			storage.set("autoLogin", true);
		} else {
			storage.remove("autoLogin");
		}
	});

	[steamUserIdInput, apiKeyInput].forEach((input) => input.addEventListener("input", clearError));
})();