if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/js/service-worker.js")
            .then(registration => {
                console.log("Service Worker registered");
            })
            .catch(err => {
                console.error("Service Worker registration failed:", err);
            });
    });
}