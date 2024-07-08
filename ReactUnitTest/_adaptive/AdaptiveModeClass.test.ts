import { getAdaptiveModeForLoaders } from 'UI/Adaptive';
import { Serializer } from 'UI/State';

describe('Serialization', () => {
    test('basic', () => {
        const AdaptiveMode = getAdaptiveModeForLoaders();
        const serializer = new Serializer();
        const origin = { am: AdaptiveMode };

        const serialized = JSON.stringify(origin, serializer.serialize);
        const parsed = JSON.parse(serialized, serializer.deserialize);
        expect(parsed).toEqual(origin);
    });
});
