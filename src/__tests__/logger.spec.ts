import logging from '../logger';

const log = logging.getLogger('LoggerSpec');

describe('Logger', () => {

    test('debug - check wiring', () => {
        log.debug('should show something');
    });

});
