import HooksCaller from 'UICore/_base/Control/WasabyUpdater/HooksCaller';
import Control from 'UICore/_base/Control';

describe('WasabyUpdater', () => {
    describe('HooksCaller', () => {
        let hooksCaller: HooksCaller;
        const fakeOwner = Control.prototype;
        beforeEach(() => {
            hooksCaller = new HooksCaller();
        });

        it('TODO', () => {
            expect(fakeOwner).toBe(fakeOwner);
        });
    });
});
