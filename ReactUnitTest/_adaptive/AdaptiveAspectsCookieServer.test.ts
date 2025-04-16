import { logger, cookie, getStore } from 'Application/Env';
import { getAdaptiveModeForLoaders, Storage } from 'UICore/Adaptive';
import { AdaptiveModeClass } from 'UICore/_adaptive/AdaptiveModeClass';
import { _clearCache } from 'UICore/_adaptive/AdaptiveInitializer';

describe('adaptiveAspects cookie server', () => {
    let currentAdaptiveAspectsCookie: string;
    let errorSpy: jest.SpyInstance;
    beforeEach(() => {
        errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

        const originalCookieGet = cookie.get;
        jest.spyOn(cookie, 'get').mockImplementation((key) => {
            if (key === 's3ac') {
                return currentAdaptiveAspectsCookie;
            }
            return originalCookieGet(key);
        });

        const originalCookieSet = cookie.set;
        jest.spyOn(cookie, 'set').mockImplementation((key, value, options) => {
            if (key === 's3ac') {
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
        _clearCache();
    });

    test('valid', () => {
        // '{"windowInnerWidth":31415,"windowInnerHeight":31415,"isPhone":true,"isTouch":true}'
        currentAdaptiveAspectsCookie = '31415!31415!!!!!!!!!10';
        const rootAdaptiveMode = getAdaptiveModeForLoaders();

        expect(JSON.stringify(rootAdaptiveMode, undefined, ' ')).toMatchSnapshot();
        // '{"windowInnerWidth":31415,"windowInnerHeight":31415,"isPhone":false,"isTouch":true,"isTablet":false}'
        expect(currentAdaptiveAspectsCookie).toBe('31415!31415!!!!!!!!!10');
        expect(errorSpy).toBeCalledTimes(0);
    });
    test('invalid', () => {
        currentAdaptiveAspectsCookie = '../../../../../../../../../../../../../../etc/passwd';
        const rootAdaptiveMode = getAdaptiveModeForLoaders();

        expect(JSON.stringify(rootAdaptiveMode, undefined, ' ')).toMatchSnapshot();
        expect(currentAdaptiveAspectsCookie).toBe('!!!!!!!!!!0');
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
            screenWidth: 123.123,
            screenHeight: 123.123,
            containerClientWidth: 123.123,
            containerClientHeight: 123.123,
        });

        expect(Storage.getInstance().get()).toMatchSnapshot();
    });
});
