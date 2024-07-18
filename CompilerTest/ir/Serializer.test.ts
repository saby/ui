/* eslint-disable @typescript-eslint/no-magic-numbers */
import Templates from './resources/Templates';
import * as IR from 'Compiler/IR';

function invoke(fn: Function, data: object = {}): unknown[] {
    return fn(data, { }, { }, false);
}

describe('Compiler/_ir/Serializer', () => {
    it.skip('check content option', () => {
        const serialized = Templates.Serializable.templates[3].toJSON();
        const contentOption = IR.deserialize(serialized);

        expect(invoke(contentOption)).toMatchSnapshot();
    });
    it.skip('check serializer pattern', () => {
        const serialized = Templates.Serializable.templates[3].toJSON();
        expect(/^CONTENT_OPTION,(\d+),/.test(serialized)).toBeTruthy();
    });
});
