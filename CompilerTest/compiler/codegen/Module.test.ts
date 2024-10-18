import createModuleProcessor from 'Compiler/_compiler/codegen/Module';

describe('Compiler/_compiler/codegen/Module', () => {
    describe('AMD', () => {
        const moduleType = 'amd';

        it('Should compile empty module', () => {
            const inst = createModuleProcessor(moduleType);
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile module in strict mode', () => {
            const inst = createModuleProcessor(moduleType);
            inst.setStrictMode(true);
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile named mode', () => {
            const inst = createModuleProcessor(moduleType);
            inst.setModuleName('Module/Component');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile module with dependencies', () => {
            const inst = createModuleProcessor(moduleType);
            inst.addDependency('first', 'f');
            inst.addDependency('second');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile module with code', () => {
            const inst = createModuleProcessor(moduleType);
            inst.addCodeBlock('var a = 1;');
            inst.addCodeBlock('var b = true;');
            inst.addCodeBlock('/* comment */');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile module with exports', () => {
            const inst = createModuleProcessor(moduleType);
            inst.addCodeBlock('function debug() { debugger; }');
            inst.setReturnableExport('debug');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile full module', () => {
            const inst = createModuleProcessor(moduleType);
            inst.setStrictMode(true);
            inst.setModuleName('Module/Component');
            inst.addDependency('first', 'f');
            inst.addDependency('second');
            inst.addCodeBlock('var a = 1;');
            inst.addCodeBlock('function debug() { debugger; }');
            inst.setReturnableExport('debug');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
    });
    describe('UMD', () => {
        const moduleType = 'umd';

        it('Should compile empty module', () => {
            const inst = createModuleProcessor(moduleType);
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile module in strict mode', () => {
            const inst = createModuleProcessor(moduleType);
            inst.setStrictMode(true);
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile named mode', () => {
            const inst = createModuleProcessor(moduleType);
            inst.setModuleName('Module/Component');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile module with dependencies', () => {
            const inst = createModuleProcessor(moduleType);
            inst.addDependency('first', 'f');
            inst.addDependency('second');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile module with code', () => {
            const inst = createModuleProcessor(moduleType);
            inst.addCodeBlock('var a = 1;');
            inst.addCodeBlock('var b = true;');
            inst.addCodeBlock('/* comment */');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile module with exports', () => {
            const inst = createModuleProcessor(moduleType);
            inst.addCodeBlock('function debug() { debugger; }');
            inst.setReturnableExport('debug');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should compile full module', () => {
            const inst = createModuleProcessor(moduleType);
            inst.setStrictMode(true);
            inst.setModuleName('Module/Component');
            inst.addDependency('first', 'f');
            inst.addDependency('second');
            inst.addCodeBlock('var a = 1;');
            inst.addCodeBlock('function debug() { debugger; }');
            inst.addCodeBlock('var b = true;');
            inst.addCodeBlock('/* comment */');
            inst.setReturnableExport('debug');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
        it('Should transform module with plugins', () => {
            const inst = createModuleProcessor(moduleType);
            inst.setModuleName('Module/Component');
            inst.addDependency('i18n!UIModule');
            inst.addDependency('css!UIModule');
            inst.addDependency('wml!UIModule/template');
            inst.addDependency('js!UIModule/module');
            const source = inst.compile();
            expect(source).toMatchSnapshot();
        });
    });
});
