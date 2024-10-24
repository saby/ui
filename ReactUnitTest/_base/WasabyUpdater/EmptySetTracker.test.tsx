import EmptySetTracker from 'UICore/_base/Control/WasabyUpdater/EmptySetTracker';

describe('WasabyUpdater', () => {
    describe('EmptySetTracker', () => {
        let callback: () => void;
        let emptySetTracker: EmptySetTracker;
        beforeEach(() => {
            callback = jest.fn();
            emptySetTracker = new EmptySetTracker(callback);
        });

        it('callback calls when set becomes empty', () => {
            emptySetTracker.add(1);
            emptySetTracker.add(2);

            expect(emptySetTracker.size).toBe(2);

            emptySetTracker.delete(2);
            expect(emptySetTracker.size).toBe(1);
            expect(callback).not.toBeCalled();

            emptySetTracker.delete(1);
            expect(emptySetTracker.size).toBe(0);
            expect(callback).toBeCalled();
        });

        it('deleting something from already empty set calls callback anyway', () => {
            emptySetTracker.delete(1);
            expect(callback).toBeCalled();
        });
    });
});
