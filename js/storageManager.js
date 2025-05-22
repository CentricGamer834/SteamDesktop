const STORAGE_KEY = "steamSettings";

export const storage = (() => {
    let state = {};
    const listeners = [];

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = JSON.parse(saved);

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    return {
        getAll() {
            return { ...state };
        },
        get(key) {
            return state[key] || null;
        },
        remove(key) {
            if (state[key] === undefined) return;
            delete state[key];
            save();
            // Notify listeners for this key only
            listeners.forEach(({ key: listenKey, cb, lastValue }, i) => {
                if (listenKey === null || listenKey === key) {
                    if (state[key] !== lastValue) {
                        cb(state);
                        listeners[i].lastValue = state[key];
                    }
                }
            });
        },
        set(key, value) {
            if (state[key] === value) return;
            state[key] = value;
            save();
            // Notify listeners for this key only
            listeners.forEach(({ key: listenKey, cb, lastValue }, i) => {
                if (listenKey === null || listenKey === key) {
                    if (state[key] !== lastValue) {
                        cb(state);
                        listeners[i].lastValue = state[key];
                    }
                }
            });
        },
        onChange(keySlashCallback, nullableCallback) {
            if (typeof keySlashCallback === "function") {
                // onChange(callback) - listen to all keys
                listeners.push({ key: null, cb: keySlashCallback, lastValue: null });
                return () => {
                    const i = listeners.findIndex(l => l.cb === keySlashCallback);
                    if (i !== -1) listeners.splice(i, 1);
                };
            } else if (typeof keySlashCallback === "string" && typeof nullableCallback === "function") {
                // onChange(key, callback)
                listeners.push({ key: keySlashCallback, cb: nullableCallback, lastValue: state[keySlashCallback] });
                return () => {
                    const i = listeners.findIndex(l => l.cb === nullableCallback && l.key === keySlashCallback);
                    if (i !== -1) listeners.splice(i, 1);
                };
            } else {
                throw new Error("Invalid arguments to settings.onChange");
            }
        },
    };
})();