import { createDependenciesController } from 'Compiler/_codegen/module/Dependencies';
import { assert } from 'chai';

describe('Compiler/codegen/module/Dependencies', () => {
    it('Should add named dependency', () => {
        const controller = createDependenciesController();
        controller.addDependency('ref', 'name');
        const [refs, names] = controller.getDependencies();
        assert.deepEqual(refs, ['ref']);
        assert.deepEqual(names, ['name']);
    });
    it('Should add anonymous dependency', () => {
        const controller = createDependenciesController();
        controller.addDependency('ref');
        const [refs, names] = controller.getDependencies();
        assert.deepEqual(refs, ['ref']);
        assert.deepEqual(names, []);
    });
    it('Should return all dependencies', () => {
        const controller = createDependenciesController();
        controller.addDependency('firstRef', 'firstName');
        controller.addDependency('secondRef');
        controller.addDependency('thirdRef', 'thirdName');
        controller.addDependency('fourthRef');
        const [refs, names] = controller.getDependencies();
        assert.deepEqual(refs, [
            'firstRef',
            'thirdRef',
            'secondRef',
            'fourthRef',
        ]);
        assert.deepEqual(names, ['firstName', 'thirdName']);
    });
    it('Should ignore the same dependency', () => {
        const controller = createDependenciesController();
        controller.addDependency('ref', 'name');
        controller.addDependency('ref', 'name');
        const [refs, names] = controller.getDependencies();
        assert.deepEqual(refs, ['ref']);
        assert.deepEqual(names, ['name']);
    });
    it('Should throw exception in case of the same dependency name', () => {
        try {
            const controller = createDependenciesController();
            controller.addDependency('firstRef', 'name');
            controller.addDependency('secondRef', 'name');
        } catch (error) {
            assert.strictEqual(
                error.message,
                'Ambiguous dependencies: multiple dependencies ("firstRef", "secondRef") has one identifier name "name"'
            );
            return;
        }

        throw new Error('Must be failed');
    });
});
