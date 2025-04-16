/**
 * @jest-environment jsdom
 */
import { _AdaptiveModeClass, _WindowSizeTracker } from 'UICore/Adaptive';

describe('ServerAdaptive (jsdom)', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
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
        });
    });
});
