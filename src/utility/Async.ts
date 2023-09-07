interface DebouncedFunction<ARGS extends any[]> {
    (...args: ARGS): any;
    lastCall?: number;
    queued?: number;
}

export function debounce<ARGS extends any[]> (time: number, fn: (...args: ARGS) => any, ...args: ARGS) {
    const debounced = fn as DebouncedFunction<ARGS>;
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

    debounced.queued = setTimeout(debounce, (time - elapsed), time, fn, ...args);
}