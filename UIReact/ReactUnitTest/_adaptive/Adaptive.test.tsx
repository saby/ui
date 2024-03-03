/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { detection, constants } from 'Env/Env';
import { _AdaptiveModeClass, _WindowSizeTracker } from 'UICore/Adaptive';

describe('ServerAdaptive', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.restoreAllMocks();
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setTimeout);
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    describe('adaptive tests', () => {
        function withWidth(width, cb) {
            const prevWidth = _WindowSizeTracker._$unit_width;
            _WindowSizeTracker._$unit_width = width;
            try {
                cb();
            } finally {
                _WindowSizeTracker._$unit_width = prevWidth;
            }
        }
        function withServer(cb) {
            const prevIsBrowserPlatform = constants.isBrowserPlatform;
            try {
                constants.isBrowserPlatform = false;
                cb();
            } finally {
                constants.isBrowserPlatform = prevIsBrowserPlatform;
            }
        }
        function withMobile(cb) {
            const prevIsMobilePlatform = detection.isMobilePlatform;
            try {
                detection.isMobilePlatform = true;
                cb();
            } finally {
                detection.isMobilePlatform = prevIsMobilePlatform;
            }
        }
        function withStorage(aspects, cb) {
            const prevAspects = storage.get();
            try {
                storage.set(aspects);
                cb();
            } finally {
                storage.set(prevAspects);
            }
        }
        function checkBreakpoint(expected) {
            sizeTracker.check((params) => {
                adaptiveMode = new _AdaptiveModeClass(params);
            })();
            expect(adaptiveMode.window.innerWidth.value).toEqual(expected);
        }

        let aspects;
        let storage;
        let sizeTracker;
        let adaptiveMode;

        beforeEach(() => {
            storage = {
                get: () => {
                    return aspects;
                },
                set: (v) => {
                    aspects = v;
                },
            };
            _WindowSizeTracker._$storage = storage;
            sizeTracker = new _WindowSizeTracker();
        });
        afterEach(() => {
            _WindowSizeTracker._$storage = undefined;
        });
        it('basic', () => {
            checkBreakpoint(1024);

            withWidth(640, () => {
                return checkBreakpoint(640);
            });
            withWidth(768, () => {
                return checkBreakpoint(768);
            });
            withWidth(1024, () => {
                return checkBreakpoint(1024);
            });
        });
        it('check server', () => {
            withStorage(
                {
                    windowInnerWidth: 500,
                },
                () => {
                    return checkBreakpoint(1024);
                }
            );
            withServer(() => {
                return withStorage(
                    {
                        windowInnerWidth: 500,
                    },
                    () => {
                        return checkBreakpoint(500);
                    }
                );
            });
        });
        it('check server (with mobile client)', () => {
            withServer(() => {
                return withMobile(() => {
                    return withStorage(
                        {
                            windowInnerWidth: 500,
                        },
                        () => {
                            return checkBreakpoint(500);
                        }
                    );
                });
            });
            withServer(() => {
                return withMobile(() => {
                    return withStorage(
                        {
                            windowInnerWidth: undefined,
                        },
                        () => {
                            return checkBreakpoint(375);
                        }
                    );
                });
            });
        });
    });
});
