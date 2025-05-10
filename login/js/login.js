(() => {
	const PROXY_URL = "https://corsproxy.io/?";
	const API_URL = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/";

	const loginForm = document.getElementById("login-form");
	const idInput = document.getElementById("accountId");
	const keyInput = document.getElementById("apiKey");
	const errorDisplay = document.getElementById("error-display");
	const autoFillCheckbox = document.getElementById("autoFill");
	const submitButton = document.getElementById("submit");

	// Show error message on screen
	const showErrorMessage = (msg) => {
		errorDisplay.innerText = msg;
		loginForm.classList.add("login-error");
	};

	// Disable timer for submit button
	const disableSubmitWithTimer = () => {
		let secondsRemaining = 3;

		submitButton.disabled = true;
		const interval = setInterval(() => {
			submitButton.innerText = `Please wait... (${secondsRemaining}s)`;

			if (--secondsRemaining < 0) {
				clearInterval(interval);
				submitButton.disabled = false;
				submitButton.innerText = "Sign In";
			}
		}, 1000);
	};

	// Check if credentials are stored in localStorage and pre-fill the form
	if (localStorage.getItem("autoFill") === "true") {
		idInput.value = localStorage.getItem("steamId") || "";
		keyInput.value = localStorage.getItem("apiKey") || "";
		autoFillCheckbox.checked = true;
	}

	// Handle form submission
	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Temporarily disable the submit button
		disableSubmitWithTimer();

		const steamId = idInput.value.trim();
		const apiKey = keyInput.value.trim();

		if (!/^\d{17}$/.test(steamId)) return showErrorMessage("Steam ID must be a 17-digit number.");
		if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) return showErrorMessage("API Key must be a 32-character hex string.");

		const url = `${PROXY_URL}${API_URL}?key=${apiKey}&steamid=${steamId}`;

		try {
			const res = await fetch(url);
			if (!res.ok) {
				// Disable form submission for 3 seconds
				disableSubmitWithTimer();

				switch (res.status) {
					case 401: return showErrorMessage("Unauthorized: Invalid API Key.");
					case 403: return showErrorMessage("Forbidden: API Key doesn't have permission.");
					case 429: return showErrorMessage("Rate limit exceeded. Please try again later.");
					default: return showErrorMessage(`Steam API error: ${res.status}`);
				}
			}

			const data = await res.json();

			if (!data?.response?.game_count || !Array.isArray(data.response.games)) {
				return showErrorMessage("Invalid Steam ID or no games found on this account.");
			}

			// Store credentials
			localStorage.setItem("steamId", steamId);
			localStorage.setItem("apiKey", apiKey);
			autoFillCheckbox.checked
				? localStorage.setItem("autoFill", "true")
				: localStorage.clear();

			// Redirect to application
			location.href = "/app";
		} catch (err) {
			console.error("Login failed:", err);
			showErrorMessage(`Network or Steam API error. Details: ${err.message}`);
			disableSubmitWithTimer();
		}
	});
})();