import QueueControlSetStateCaller from 'UICore/_base/Control/WasabyUpdater/QueueControlSetStateCaller';
import Control from 'UICore/_base/Control';

describe('WasabyUpdater', () => {
    describe('HooksCaller', () => {
        let queueControlSetStateCaller: QueueControlSetStateCaller;
        const fakeControl = Control.prototype;
        beforeEach(() => {
            queueControlSetStateCaller = new QueueControlSetStateCaller();
        });

        it('TODO', () => {
            expect(fakeControl).toBe(fakeControl);
        });
    });
});
