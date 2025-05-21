(() => {
	const PROXY_URL = "https://corsproxy.io/?";

	const loginForm = document.getElementById("login-form");
	const steamIdInput = document.getElementById("accountId");
	const apiKeyInput = document.getElementById("apiKey");
	const errorDisplay = document.getElementById("error-display");
	const autoFillCheckbox = document.getElementById("auto-fill");
	const autoLoginCheckbox = document.getElementById("auto-login");
	const submitButton = document.getElementById("submit");

	const isValidSteamId = (id) => /^[0-9]{17}$/.test(id);
	const isValidApiKey = (key) => /^[A-F0-9]{32}$/i.test(key);

	const showError = (msg) => {
		errorDisplay.textContent = msg;
		loginForm.classList.add("login-error");
	}

	const clearError = () => {
		errorDisplay.textContent = "";
		loginForm.classList.remove("login-error");
	}

	const disableSubmit = () => {
		let seconds = 3;
		submitButton.disabled = true;
		submitButton.textContent = `Please wait... (${seconds--}s)`;

		setInterval(() => {
			if (seconds < 0) {
				clearInterval(this);
				submitButton.disabled = false;
				submitButton.textContent = "Sign In";
			} else {
				submitButton.textContent = `Please wait... (${seconds--}s)`;
			}
		}, 1000);
	}

	const validateAndRedirect = async (steamId, apiKey) => {
		if (!steamId) throw new Error("Steam ID is required");
		if (!apiKey) throw new Error("API Key is required");
		if (!isValidSteamId(steamId)) throw new Error("Invalid Steam ID (must be 17 digits)");
		if (!isValidApiKey(apiKey)) throw new Error("API Key must be 32-character hexadecimal");
		if (!isValidSteamId(steamId) || !isValidApiKey(apiKey)) return false;

		const url = `${PROXY_URL}https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}`;

		try {
			const res = await fetch(url);
			if (!res.ok) {
				if (res.status === 401) showError("❌ Unauthorized: Invalid API Key.");
				else if (res.status === 403) showError("🚫 Forbidden: No permission.");
				else if (res.status === 429) showError("⏱ Rate limited. Try again later.");
				else showError(`⚠️ Steam API error: ${res.status}`);
				return false;
			}

			const data = await res.json();
			if (!data?.response?.game_count || !Array.isArray(data.response.games)) {
				showError("❗ No games found or invalid Steam ID.");
				return false;
			}

			window.location.replace("app.html");
			return true;
		} catch (err) {
			showError(`💥 Network error: ${err.message}`);
			return false;
		}
	}

	// Load saved data
	if (localStorage.getItem("autoFill") === "true") {
		steamIdInput.value = localStorage.getItem("steamId") || "";
		apiKeyInput.value = localStorage.getItem("apiKey") || "";
		autoFillCheckbox.checked = true;
	}

	if (localStorage.getItem("autoLogin") === "true") {
		autoLoginCheckbox.checked = true;
		disableSubmit();
		validateAndRedirect(
			localStorage.getItem("steamId") || "",
			localStorage.getItem("apiKey") || "",
			false
		);
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

		const success = await validateAndRedirect(steamId, apiKey, true);

		if (!success) return;

		if (autoFillCheckbox.checked) {
			localStorage.setItem("autoFill", "true");
			localStorage.setItem("steamId", steamId);
			localStorage.setItem("apiKey", apiKey);
		} else {
			localStorage.removeItem("autoFill");
			localStorage.removeItem("steamId");
			localStorage.removeItem("apiKey");
		}

		if (autoLoginCheckbox.checked) {
			localStorage.setItem("autoLogin", "true");
		} else {
			localStorage.removeItem("autoLogin");
		}
	});

	[steamIdInput, apiKeyInput].forEach(input =>
		input.addEventListener("input", clearError)
	);
})();