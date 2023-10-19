/**
 * @jest-environment jsdom
 */
import { Logger } from 'UI/Utils';
import ConsoleLogger from 'Env/_Env/ConsoleLogger';

describe('UICommon/_utils/Logger //Started testing log message, please ignore console log', () => {
    beforeEach(() => {
        jest.spyOn(ConsoleLogger.prototype, 'log').mockImplementation(() => {
            return null;
        });
        jest.spyOn(ConsoleLogger.prototype, 'info').mockImplementation(() => {
            return null;
        });
        jest.spyOn(ConsoleLogger.prototype, 'warn').mockImplementation(() => {
            return null;
        });
        jest.spyOn(ConsoleLogger.prototype, 'error').mockImplementation(() => {
            return null;
        });
    });

    let result;

    describe('Logger => error()', () => {
        it('get error object', () => {
            result = Logger.error('error');
            const stack = result.errorInfo.stack;
            const msg = result.errorInfo.message;
            const name = result.errorInfo.name;
            expect(stack).toBeDefined();
            expect(msg).toBe('');
            expect(name).toBe('Error');
        });
    });

    describe('Logger => lifeError()', () => {
        it('get error object', () => {
            result = Logger.lifeError('error text');
            const stack = result.errorInfo.stack;
            const msg = result.errorInfo.message;
            const name = result.errorInfo.name;
            expect(stack).toBeDefined();
            expect(msg).toBe('');
            expect(name).toBe('Error');
        });
    });

    describe('Logger => templateError()', () => {
        it('get error object', () => {
            result = Logger.templateError('error text');
            const stack = result.errorInfo.stack;
            const msg = result.errorInfo.message;
            const name = result.errorInfo.name;
            expect(stack).toBeDefined();
            expect(msg).toBe('');
            expect(name).toBe('Error');
        });
    });
});
