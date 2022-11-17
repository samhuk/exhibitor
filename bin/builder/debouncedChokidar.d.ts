import { FSWatcher } from 'chokidar';
export declare const watch: (fn: () => any, dirsOrWatcher: string[] | FSWatcher, delayMs?: number, onReadyFn?: () => any) => void;
export default watch;
