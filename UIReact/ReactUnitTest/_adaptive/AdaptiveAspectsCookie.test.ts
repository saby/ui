import { logger, cookie } from 'Application/Env';
import { unsafe_getRootAdaptiveMode } from 'UICore/Adaptive';

describe('adaptiveAspects cookie', () => {
    let currentAdaptiveAspectsCookie: string;
    let errorSpy: jest.SpyInstance;
    beforeEach(() => {
        errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

        const originalCookieGet = cookie.get;
        jest.spyOn(cookie, 'get').mockImplementation((key) => {
            if (key === 'adaptiveAspects') {
                return currentAdaptiveAspectsCookie;
            }
            return originalCookieGet(key);
        });

        const originalCookieSet = cookie.set;
        jest.spyOn(cookie, 'set').mockImplementation((key, value, options) => {
            if (key === 'adaptiveAspects') {
                currentAdaptiveAspectsCookie = value;
                return true;
            }
            return originalCookieSet(key, value, options);
        });
    });
    afterEach(() => {
        currentAdaptiveAspectsCookie = null;
        jest.restoreAllMocks();
    });

    test('valid', () => {
        currentAdaptiveAspectsCookie =
            '{"windowInnerWidth":31415,"windowInnerHeight":31415,"isPhone":true,"isTouch":true}';
        const rootAdaptiveMode = unsafe_getRootAdaptiveMode();

        expect(JSON.stringify(rootAdaptiveMode, undefined, ' ')).toMatchSnapshot();
        expect(currentAdaptiveAspectsCookie).toBe(
            '{"windowInnerWidth":31415,"windowInnerHeight":31415,"isPhone":false,"isTouch":true,"isTablet":false}'
        );
        expect(errorSpy).toBeCalledTimes(0);
    });
    test('invalid', () => {
        currentAdaptiveAspectsCookie = '../../../../../../../../../../../../../../etc/passwd';
        const rootAdaptiveMode = unsafe_getRootAdaptiveMode();

        expect(JSON.stringify(rootAdaptiveMode, undefined, ' ')).toMatchSnapshot();
        expect(currentAdaptiveAspectsCookie).toBe(
            '{"isPhone":false,"isTablet":false,"isTouch":false}'
        );
        expect(errorSpy).toBeCalledTimes(1);
    });
});
