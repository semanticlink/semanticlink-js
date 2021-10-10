/**
 * This is a hand written type file to get the tests running with ulog. The library has a dependency on
 * `anylogger` (not `ulog`).
 *
 * In the future both `anylogger` and `ulog` should have typescript types, however issues for these
 * features have been open for some time.
 *
 * Alternate strategies include generating types from the package using `dts-gen`. e.g.
 *     > yarn add ulog dts-gen
 *     > node_modules\.bin\dts-gen -m ulog
 */
declare module 'ulog' {
    let level: number;

    interface LevelConstants {
        NONE: 0;
        ERROR: 1;
        WARN: 2;
        INFO: 3;
        LOG: 4;
        DEBUG: 5;
        TRACE: 6;
    }
    type ValueOf<T> = T[keyof T]
    export type LogLevel = ValueOf<LevelConstants>;
}
