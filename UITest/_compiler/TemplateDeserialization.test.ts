import {
    findRdiFunctionCall,
    repairTemplateFunction
} from 'UICommon/_state/TemplateDeserialization';
import serializedTemplates from 'UITest/_compiler/SerializedTemplates';

function removeRdiCall(text: string): string {
    return text.replace(/\w+\.rdi[^(]*\([^)]+\)/g, 'undefined');
}

describe('UICommon/_state/TemplateDeserialization', () => {
    describe('findRdiFunctionCall', () => {
        it('should find rdi function call in debug code', () => {
            const identifiers = {
                thelpers: undefined,
                depsLocal: undefined,
                viewController: undefined
            };
            const template = 'thelpers.rdi /* registerDeserializableIdentifiers */(thelpers, depsLocal, viewController);';

            findRdiFunctionCall(identifiers, template);

            expect(identifiers).toHaveProperty('thelpers');
            expect(identifiers.thelpers).toEqual('thelpers');

            expect(identifiers).toHaveProperty('depsLocal');
            expect(identifiers.depsLocal).toEqual('depsLocal');

            expect(identifiers).toHaveProperty('viewController');
            expect(identifiers.viewController).toEqual('viewController');
        });
        it('should find rdi function call in release code', () => {
            const identifiers = {
                thelpers: undefined,
                depsLocal: undefined,
                viewController: undefined
            };
            const template = ',d.rdi(d,o,t),';

            findRdiFunctionCall(identifiers, template);

            expect(identifiers).toHaveProperty('thelpers');
            expect(identifiers.thelpers).toEqual('d');

            expect(identifiers).toHaveProperty('depsLocal');
            expect(identifiers.depsLocal).toEqual('o');

            expect(identifiers).toHaveProperty('viewController');
            expect(identifiers.viewController).toEqual('t');
        });
        it('should not find rdi function call', () => {
            const identifiers = { };
            const template = ',d.E(d,o,t),';

            findRdiFunctionCall(identifiers, template);

            expect(identifiers).not.toHaveProperty('thelpers');
            expect(identifiers).not.toHaveProperty('depsLocal');
            expect(identifiers).not.toHaveProperty('viewController');
        });
    });

    serializedTemplates.forEach((serializedTemplate, index) => {
        it(`should parse template ${index + 1} correctly with rdi`, () => {
            const { identifiers } = repairTemplateFunction(serializedTemplate.template);

            expect(identifiers).toEqual(serializedTemplate.identifiers);
        });
        it(`should parse template ${index + 1} correctly without rdi`, () => {
            const { identifiers } = repairTemplateFunction(removeRdiCall(serializedTemplate.template));

            expect(identifiers).toEqual(serializedTemplate.identifiers);
        });
    });
});
