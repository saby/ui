/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { detection, constants } from 'Env/Env';
import { create } from 'UI/Adaptive';

describe('ServerAdaptive', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.restoreAllMocks();
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
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
            const prevWidth = window.innerWidth;
            window.innerWidth = width;
            try {
                cb();
            } finally {
                window.innerWidth = prevWidth;
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
            breakpointsUtils.checkBreakpoint((match) => {
                adaptiveMode = match;
            })();
            expect(adaptiveMode._$internal_curBreakpoint).toEqual(expected);
        }

        let aspects;
        let storage;
        let breakpointsUtils;
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
            breakpointsUtils = create(undefined, storage);
        });
        it('basic', () => {
            checkBreakpoint('lg');

            withWidth(500, () => {
                return checkBreakpoint('');
            });
            withWidth(600, () => {
                return checkBreakpoint('');
            });
            withWidth(700, () => {
                return checkBreakpoint('sm');
            });
            withWidth(800, () => {
                return checkBreakpoint('md');
            });
            withWidth(900, () => {
                return checkBreakpoint('md');
            });
            withWidth(1000, () => {
                return checkBreakpoint('md');
            });
            withWidth(1100, () => {
                return checkBreakpoint('lg');
            });
        });
        it('check server', () => {
            withStorage(
                {
                    width: 500,
                },
                () => {
                    return checkBreakpoint('lg');
                }
            );
            withServer(() => {
                return withStorage(
                    {
                        width: 500,
                    },
                    () => {
                        return checkBreakpoint('');
                    }
                );
            });
        });
        it('check server (with mobile client)', () => {
            withServer(() => {
                return withMobile(() => {
                    return withStorage(
                        {
                            width: 500,
                        },
                        () => {
                            return checkBreakpoint('');
                        }
                    );
                });
            });
            withServer(() => {
                return withMobile(() => {
                    return withStorage(
                        {
                            width: undefined,
                        },
                        () => {
                            return checkBreakpoint('sm');
                        }
                    );
                });
            });
        });
    });
});
