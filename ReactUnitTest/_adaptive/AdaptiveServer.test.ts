import { detection } from 'Env/Env';
import { _AdaptiveModeClass, _WindowSizeTracker } from 'UICore/Adaptive';

describe('ServerAdaptive', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    describe('adaptive tests', () => {
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
        it('check server', () => {
            withStorage(
                {
                    windowInnerWidth: 500,
                },
                () => {
                    return checkBreakpoint(500);
                }
            );
        });
        it('check server (with mobile client)', () => {
            withMobile(() => {
                return withStorage(
                    {
                        windowInnerWidth: 500,
                    },
                    () => {
                        return checkBreakpoint(500);
                    }
                );
            });
            withMobile(() => {
                return withStorage(
                    {
                        windowInnerWidth: undefined,
                    },
                    () => {
                        return checkBreakpoint(376);
                    }
                );
            });
        });
    });
});
