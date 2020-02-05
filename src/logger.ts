import ulog from 'ulog';

/**
 * The logging class is the API provided for performing logging.
 *
 * Other functions are supported by ulog, but this gives us a rich enough
 * set of logging options without baking it a dependency on any specific
 * logging framework.
 */
export interface Logger {
    /**
     *
     * @param format the information to be displayed in string format
     * @param args any remaining objects to be displayed
     */
    trace(format: string, ...args: any[]): void;

    /**
     *
     * @param format the information to be displayed in string format
     * @param args any remaining objects to be displayed
     */
    debug(format: string, ...args: any[]): void;

    /**
     *
     * @param format the information to be displayed in string format
     * @param args any remaining objects to be displayed
     */
    info(format: string, ...args: any[]): void;

    /**
     *
     * @param format the information to be displayed in string format
     * @param args any remaining objects to be displayed
     */
    warn(format: string, ...args: any[]): void;

    /**
     *
     * @param format the information to be displayed in string format
     * @param args any remaining objects to be displayed
     */
    error(format: string, ...args: any[]): void;

    /**
     *
     * @param format the information to be displayed in string format
     * @param args any remaining objects to be displayed
     */
    fatal(format: string, ...args: any[]): void;

}

export default class Logging {
    public static setupLogging(env?: string) {
        ulog.level = Logging.getLogLevel(env);
    }

    /**
     * Determine the level of logging to use.
     *
     * The default for ulog is 'WARN'. This is useful for deployed
     * situations. For developer situation we probably want to take the
     * performance hit and get a little more logging. This logs can be filtered
     * with the browser debugger.
     *
     */

    public static getLogLevel(env?: string): number {
        if (env !== 'production') {
            return ulog.TRACE;
        } else {
            return ulog.WARN;
        }
    }

    /**
     * This provides a small shim over the logging framework so we can
     * add a different logger.
     *
     * @see {@link https://github.com/download/ulog}
     * @see {@link https://www.npmjs.com/package/ulog}
     */
    public static getLogger(name?: string): Logger {
        return ulog(name) as Logger;
    }
}
