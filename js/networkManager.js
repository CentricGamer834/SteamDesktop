export const network = (() => {
    const PROXY_URL = "https://corsproxy.io/";

    function proxifyUrl(url) {
        if (!url) throw new Error("Missing URL for proxy.");
        return `${PROXY_URL}?${url}`;
    }

    async function fetchJson(url) {
        const requestInfo = {
            url,
            status: null,
            statusText: null,
            headers: {},
            content: null,
            ok: false,
            isNetworkError: false,
        };

        try {
            const res = await fetch(url);
            requestInfo.status = res.status;
            requestInfo.statusText = res.statusText;
            requestInfo.headers = Object.fromEntries(res.headers.entries());
            requestInfo.ok = res.ok;

            const contentType = res.headers.get("content-type") || "";
            const isJson = contentType.includes("application/json");

            const body = isJson ? await res.json().catch(() => null) : await res.text();
            requestInfo.content = body;

            if (!res.ok) {
                requestInfo.isNetworkError = true;
                throw new NetworkError(`HTTP ${res.status}: ${res.statusText}`, requestInfo);
            }

            return requestInfo;

        } catch (err) {
            if (err instanceof NetworkError) throw err;

            requestInfo.status = 0;
            requestInfo.statusText = "FetchError";
            requestInfo.isNetworkError = true;
            requestInfo.content = null;
            throw new NetworkError("Network fetch failed", requestInfo);
        }
    }

    return {
        proxifyUrl,

        translateHttpError(err) {
            if (!err || !err.isNetworkError) return "❌ Unexpected error occurred.";

            const statusMap = {
                400: "⚠️ Bad request. Check your inputs.",
                401: "❌ Unauthorized: Invalid API Key OR Proxy error.",
                403: "🚫 Forbidden: Access denied.",
                404: "🔍 Not found: Invalid ID or endpoint.",
                429: "⏱ Rate limited. Try again later.",
                500: "🔥 Steam server error.",
                502: "💀 Bad gateway. Steam might be down.",
                503: "🛠 Service unavailable. Try again shortly.",
            };

            return statusMap[err.status] || `⚠️ Steam API error: ${err.status} ${err.statusText}`;
        },

        async fetchAppDetails(appid) {
            if (!appid) throw new Error("Missing appid for app details request.");
            const url = proxifyUrl(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
            const data = await fetchJson(url);
            if (!data[appid]?.success) throw new Error(`App details fetch failed for appid ${appid}.`);
            return data[appid].data;
        },

        async fetchOwnedGames(steamUserId, steamApiKey, includePlayedFreeGames = true, includeAppInfo = true) {
            if (!steamUserId || !steamApiKey) throw new Error("Missing Steam credentials.");
            const url = proxifyUrl(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamUserId}&include_appinfo=${includeAppInfo ? 1 : 0}&include_played_free_games=${includePlayedFreeGames ? 1 : 0}&format=json`);
            const data = await fetchJson(url);
            const games = data?.content?.response?.games;
            if (!Array.isArray(games) || !games.length) throw new Error("No owned games found.");
            return games;
        },

        async fetchUserDetails(steamUserId, steamApiKey) {
            if (!steamUserId || !steamApiKey) throw new Error("Missing Steam credentials.");
            const url = proxifyUrl(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamUserId}`);
            const data = await fetchJson(url);
            const players = data.response?.players?.[0];
            if (!Array.isArray(players) || !players.length) throw new Error("User details not found.");
            return players;
        }
    };
})();