export async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/js/service-worker.js").then(registration => {
            console.log("SW registered:", registration);
        }).catch(registrationError => {
            console.log("SW registration failed:", registrationError);
        });
    }
}