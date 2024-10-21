import { Record } from 'Types/entity';
import { observeVersionChange } from 'UI/WasabyReactivity';
describe('WasabyReactivity на сервере', () => {
    it('реактивность не должна работать', () => {
        const record = new Record({
            rawData: {
                text: 'first text',
            },
        });
        const onVersionChanged = jest.fn();
        observeVersionChange(record, onVersionChanged);

        const startVersion = record.getVersion();
        record.set('text', 'second text');
        const endVersion = record.getVersion();

        expect(endVersion).not.toBe(startVersion);
        expect(onVersionChanged).not.toBeCalled();
    });
});
