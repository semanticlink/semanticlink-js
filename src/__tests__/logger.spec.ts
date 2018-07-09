import { log, LogLevel, setLogLevel } from '../logger';

describe('Logger', () => {
  /**
   * Haven't bother to mock out console
   */

  test('debug - show', () => {
    setLogLevel(LogLevel.Debug);
    log.debug('should show something');
  });

  test('debug - show single object', () => {
    setLogLevel(LogLevel.Debug);
    log.debug('should show something', { obj: 'value' });
  });

  test('debug - show multiple objects', () => {
    setLogLevel(LogLevel.Debug);
    log.debug('should show something', { obj: 'value' }, { another: 'then' });
  });

  test('debug - no show', () => {
    setLogLevel(LogLevel.Warn);
    log.debug('should not show anything');
  });
});
