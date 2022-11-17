"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = void 0;
const chokidar_1 = require("chokidar");
const debounce = (fn, debounceMs = 250) => {
    let currentTimeout = null;
    return (...args) => {
        clearTimeout(currentTimeout);
        currentTimeout = setTimeout(() => {
            fn(...args);
        }, debounceMs);
    };
};
const watch = (fn, dirsOrWatcher, delayMs, onReadyFn) => {
    const debouncedFn = debounce(fn, delayMs !== null && delayMs !== void 0 ? delayMs : 500);
    const watcher = Array.isArray(dirsOrWatcher) ? (0, chokidar_1.watch)(dirsOrWatcher) : dirsOrWatcher;
    watcher.on('ready', () => {
        onReadyFn === null || onReadyFn === void 0 ? void 0 : onReadyFn();
        watcher.on('all', () => {
            debouncedFn();
        });
    });
};
exports.watch = watch;
exports.default = exports.watch;
