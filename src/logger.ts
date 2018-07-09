/**
 * A basic logger
 */
export interface Logger {
  /**
   *
   * @param {string} message the information to be displayed in string format
   * @param {*} supportingData any remaining objects to be displayed
   */
  debug(message: string, ...supportingData: any[]): void;

  /**
   *
   * @param {string} message the information to be displayed in string format
   * @param {*} supportingData any remaining objects to be displayed
   */
  info(message: string, ...supportingData: any[]): void;

  /**
   *
   * @param {string} message the information to be displayed in string format
   * @param {*} supportingData any remaining objects to be displayed
   */
  warn(message: string, ...supportingData: any[]): void;

  /**
   *
   * @param {string} message the information to be displayed in string format
   * @param {*} supportingData any remaining objects to be displayed
   */
  error(message: string, ...supportingData: any[]): void;
}

/**
 * Log level for a logger.
 */
export enum LogLevel {
  Trace = 1,
  Debug = 2,
  Info = 3,
  Warn = 4,
  Error = 5,
  Fatal = 6,
}

/**
 * Default level is info and above
 */
let showLevel: LogLevel = LogLevel.Info;

/**
 * Set the global log level for all logging. Default {@link LogLevel.Info} and above which might explain if can't see some
 * logging in the browser
 * @param {LogLevel} level
 */
export function setLogLevel(level: LogLevel) {
  showLevel = level;
}

class ConsoleLogger implements Logger {
  private static log(level: LogLevel, msg: string, data: any[]) {
    if (level >= showLevel) {
      if (data.length > 0) {
        this.toConsoleMethod(level)(msg, ...data);
      } else {
        this.toConsoleMethod(level)(msg);
      }
    }
  }

  private static toConsoleMethod(val: LogLevel): (message?: any, ...optionalParams: any[]) => void {
    switch (val) {
      case LogLevel.Debug:
      case LogLevel.Trace:
        return console.log;
      case LogLevel.Info:
        return console.info;
      case LogLevel.Warn:
        return console.warn;
      case LogLevel.Error:
      case LogLevel.Fatal:
        return console.error;
    }
  }

  public debug(message: string, ...data: any[]): void {
    ConsoleLogger.log(LogLevel.Debug, message, data);
  }

  public error(message: string, ...data: any[]): void {
    ConsoleLogger.log(LogLevel.Error, message, data);
  }

  public info(message: string, ...data: any[]): void {
    ConsoleLogger.log(LogLevel.Info, message, data);
  }

  public warn(message: string, ...data: any[]): void {
    ConsoleLogger.log(LogLevel.Warn, message, data);
  }
}

let log: Logger;
log = new ConsoleLogger();

export { log };