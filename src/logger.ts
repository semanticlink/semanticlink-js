/**
 * A basic logger
 */
export interface Logger {
  /**
   *
   * @param {string} message the information to be displayed in string format
   * @param {*} supportingData any remaining objects to be displayed
   */
  trace(message: string, ...supportingData: any[]): void;

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

  /**
   *
   * @param {string} message the information to be displayed in string format
   * @param {*} supportingData any remaining objects to be displayed
   */
  fatal(message: string, ...supportingData: any[]): void;

  /**
   * Set the log level to be shown
   * @param {LogLevel} level
   */
  showLogLevel(level: LogLevel): void;
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
 * Set the global log level for all logging. Default {@link LogLevel.Debug} which is browsers is verbose. This logger
 * also has {@link LogLevel.Trace} for even more information that logs on the console at debug verbose
 * @param {LogLevel} level
 */
export function setLogLevel(level: LogLevel) {
  log.showLogLevel(level);
}

class ConsoleLogger implements Logger {
  private static showLevel: LogLevel;

  private static log(level: LogLevel, msg: string, data: any[]) {
    if (level >= ConsoleLogger.showLevel) {
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
        return console.debug;
      case LogLevel.Info:
        return console.info;
      case LogLevel.Warn:
        return console.warn;
      case LogLevel.Error:
      case LogLevel.Fatal:
        return console.error;
    }
  }

  constructor(level: LogLevel) {
    ConsoleLogger.showLevel = level;
  }

  public trace(message: string, ...data: any[]): void {
    ConsoleLogger.log(LogLevel.Trace, message, data);
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

  public fatal(message: string, ...data: any[]): void {
    ConsoleLogger.log(LogLevel.Fatal, message, data);
  }

  public showLogLevel(level: LogLevel): void {
    if (level) {
      ConsoleLogger.showLevel = level;
    }
  }
}

export const log: Logger = new ConsoleLogger(LogLevel.Debug);
