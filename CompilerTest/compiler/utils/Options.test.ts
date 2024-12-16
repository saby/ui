import { Options, IOptions } from 'Compiler/_compiler/utils/Options';
import { assert } from 'chai';

describe('Compiler/utils/Options', () => {
    it('should use default AMD type', () => {
        const options = new Options({
            fileName: 'Module/component/template.wml',
        } as IOptions);

        assert.deepEqual(options.moduleType, ['amd']);
    });

    it('should lowercase provided types in array', () => {
        const options = new Options({
            fileName: 'Module/component/template.wml',
            moduleType: ['AMD', 'Umd'],
        } as IOptions);

        assert.deepEqual(options.moduleType, ['amd', 'umd']);
    });

    it('should lowercase provided types in string', () => {
        const options = new Options({
            fileName: 'Module/component/template.wml',
            moduleType: 'Umd',
        } as IOptions);

        assert.deepEqual(options.moduleType, ['umd']);
    });

    it('should throw exception in case of unknown type', () => {
        try {
            new Options({
                fileName: 'Module/component/template.wml',
                moduleType: 'CommonJS',
            } as IOptions);
        } catch (error) {
            assert.strictEqual(
                error.message,
                'Переданный формат генерации модулей "commonjs" не поддерживается компилятором'
            );
            return;
        }

        throw new Error('In this test an exception must be thrown');
    });
});
