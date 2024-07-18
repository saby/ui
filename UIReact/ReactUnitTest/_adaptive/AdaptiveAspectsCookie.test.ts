/**
 * @jest-environment jsdom
 */
import { logger, cookie } from 'Application/Env';
import { unsafe_getRootAdaptiveMode, Storage } from 'UICore/Adaptive';

describe('adaptiveAspects cookie', () => {
    let currentAdaptiveAspectsCookie: string;
    let errorSpy: jest.SpyInstance;
    beforeEach(() => {
        errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

        const originalCookieGet = cookie.get;
        jest.spyOn(cookie, 'get').mockImplementation((key) => {
            if (key === 's3ab') {
                return currentAdaptiveAspectsCookie;
            }
            return originalCookieGet(key);
        });

        const originalCookieSet = cookie.set;
        jest.spyOn(cookie, 'set').mockImplementation((key, value, options) => {
            if (key === 's3ab') {
                currentAdaptiveAspectsCookie = value;
                return true;
            }
            return originalCookieSet(key, value, options);
        });
    });
    afterEach(() => {
        currentAdaptiveAspectsCookie = null;
        jest.restoreAllMocks();

        Storage.getInstance()._clear();
    });

    test('valid', () => {
        // '{"windowInnerWidth":31415,"windowInnerHeight":31415,"isPhone":true,"isTouch":true}'
        currentAdaptiveAspectsCookie = '31415!31415!!!!!!!10';
        const rootAdaptiveMode = unsafe_getRootAdaptiveMode();

        expect(JSON.stringify(rootAdaptiveMode, undefined, ' ')).toMatchSnapshot();
        // '{"windowInnerWidth":31415,"windowInnerHeight":31415,"isPhone":false,"isTouch":true,"isTablet":false}'
        expect(currentAdaptiveAspectsCookie).toBe('1024!768!1024!768!!!!!8');
        expect(errorSpy).toBeCalledTimes(0);
    });
    test('invalid', () => {
        currentAdaptiveAspectsCookie = '../../../../../../../../../../../../../../etc/passwd';
        const rootAdaptiveMode = unsafe_getRootAdaptiveMode();

        expect(JSON.stringify(rootAdaptiveMode, undefined, ' ')).toMatchSnapshot();
        expect(currentAdaptiveAspectsCookie).toBe('1024!768!1024!768!!!!!8');
        expect(errorSpy).toBeCalledTimes(0);
    });
    test('set', () => {
        Storage.getInstance().set({
            windowInnerWidth: 31415,
            windowInnerHeight: 31415,
            isPhone: true,
            isTouch: true,
        });

        expect(Storage.getInstance().get()).toMatchSnapshot();
    });
    test('set with dots', () => {
        Storage.getInstance().set({
            windowInnerWidth: 123.123,
            windowInnerHeight: 123.123,
            windowOuterWidth: 123.123,
            windowOuterHeight: 123.123,
            viewportWidth: 123.123,
            viewportHeight: 123.123,
            containerClientWidth: 123.123,
            containerClientHeight: 123.123,
        });

        const res = Storage.getInstance().get();
        expect(res).toMatchSnapshot();
    });
});
