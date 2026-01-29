export function debounce(time, fn, ...args) {
    const debounced = fn;
    const elapsed = Date.now() - (debounced.lastCall ?? 0);
    if (elapsed >= time) {
        fn(...args);
        debounced.lastCall = Date.now();
        delete debounced.queued;
        return;
    }
    if (debounced.queued !== undefined) {
        return;
    }
    debounced.queued = window.setTimeout(debounce, (time - elapsed), time, fn, ...args);
}
