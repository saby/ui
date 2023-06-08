import {
    Container,
    ContainerType,
    InternalNode,
    InternalNodeType,
} from 'Compiler/_core/internal/Container';
import { ProgramType } from 'Compiler/_core/internal/Storage';
import { Parser } from 'Compiler/_expressions/Parser';
import { assert } from 'chai';
import { ProgramNode } from 'Compiler/_expressions/Nodes';

function parse(text: string): ProgramNode {
    return new Parser().parse(text);
}

interface IInternalStandard {
    index: number;
    isInDataType: boolean;
    type: InternalNodeType;

    test: string | null;
    storage: string[];
    ref: Container;

    children: IInternalStandard[];
}

function assertInternal(
    actual: InternalNode,
    expected: IInternalStandard
): void {
    assert.strictEqual(actual.index, expected.index);
    assert.strictEqual(actual.isInDataType, expected.isInDataType);
    assert.strictEqual(actual.type, expected.type);

    if (actual.test !== null && expected.test !== null) {
        assert.strictEqual(actual.test.node.string, expected.test);
    } else {
        assert.isNull(actual.test);
        assert.isNull(expected.test);
    }

    const actualPrograms = actual.storage
        .getMeta()
        .map((meta) => {
            return meta.node.string;
        })
        .sort();
    const expectedPrograms = expected.storage.sort();
    assert.strictEqual(actualPrograms.length, expectedPrograms.length);
    assert.deepEqual(actualPrograms, expectedPrograms);
    assert.strictEqual(actual.ref, expected.ref);

    assert.strictEqual(actual.children.length, expected.children.length);
    for (let index = 0; index < actual.children.length; ++index) {
        assertInternal(actual.children[index], expected.children[index]);
    }
}

function makeConditionalBlocked(
    node: IInternalStandard,
    useTest: boolean = true
) {
    if (node.test !== null && useTest) {
        node.storage.push(node.test);
    }
    node.test = null;
    node.type = InternalNodeType.BLOCK;
}

describe('Compiler/core/internal/Container', () => {
    describe('Tree of container nodes', () => {
        let globalContainer: Container;

        beforeEach(() => {
            globalContainer = new Container(null, ContainerType.GLOBAL);
        });
        afterEach(() => {
            globalContainer = null;
        });

        it('register programs and check identifiers', () => {
            const identifiers = [
                'a',
                'b',
                'c',
                'd',
                'e',
                'f',
                'g',
                'h',
                'i',
                'j',
                'k',
                'l',
                'm',
                'n',
            ];
            globalContainer.registerProgram(
                parse('a+b'),
                ProgramType.SIMPLE,
                'simple'
            );
            globalContainer.registerProgram(
                parse('c/d'),
                ProgramType.ATTRIBUTE,
                'attribute'
            );
            globalContainer.registerProgram(
                parse('e*f'),
                ProgramType.BIND,
                'bind'
            );
            globalContainer.registerProgram(
                parse('g(h)'),
                ProgramType.EVENT,
                'event'
            );
            globalContainer.registerProgram(
                parse('i?j:k'),
                ProgramType.OPTION,
                'option'
            );
            globalContainer.registerProgram(
                parse('l.start()'),
                ProgramType.FLOAT,
                'cycle'
            );
            globalContainer.registerTestProgram(parse('m&&n'));
            const actual = globalContainer.getOwnIdentifiers().sort();
            assert.deepEqual(actual, identifiers);
        });
        it('register program and check identifiers (with initial identifier)', () => {
            const identifiers = ['a', 'b'];
            globalContainer.addIdentifier('a');
            globalContainer.registerProgram(
                parse('b'),
                ProgramType.SIMPLE,
                'simple'
            );
            const actual = globalContainer.getOwnIdentifiers().sort();
            assert.deepEqual(actual, identifiers);
        });
        it('register program and check identifiers on component/content option container type', () => {
            const componentContainer = globalContainer.createContainer(
                ContainerType.COMPONENT
            );
            const optionContainer = componentContainer.createContainer(
                ContainerType.CONTENT_OPTION
            );
            optionContainer.addIdentifier('content');
            componentContainer.registerProgram(
                parse('a'),
                ProgramType.ATTRIBUTE,
                'attribute'
            );
            componentContainer.registerProgram(
                parse('b'),
                ProgramType.OPTION,
                'option'
            );
            optionContainer.registerProgram(
                parse('c'),
                ProgramType.SIMPLE,
                'data'
            );
            optionContainer.registerProgram(
                parse('d + content.e'),
                ProgramType.SIMPLE,
                'data'
            );
            assert.deepEqual(optionContainer.getOwnIdentifiers().sort(), [
                'content',
            ]);
            assert.isEmpty(componentContainer.getOwnIdentifiers().sort());
            assert.deepEqual(globalContainer.getOwnIdentifiers().sort(), [
                'a',
                'b',
                'c',
                'd',
            ]);
        });
        it('register program and check identifiers on template container type', () => {
            const templateContainer = globalContainer.createContainer(
                ContainerType.TEMPLATE
            );
            templateContainer.registerProgram(
                parse('a'),
                ProgramType.ATTRIBUTE,
                'attribute'
            );
            templateContainer.registerProgram(
                parse('b'),
                ProgramType.OPTION,
                'option'
            );
            assert.deepEqual(templateContainer.getOwnIdentifiers().sort(), [
                'a',
                'b',
            ]);
            assert.deepEqual(globalContainer.getOwnIdentifiers().sort(), [
                'a',
                'b',
            ]);
        });
        it('register program and check identifiers on conditional container type', () => {
            const conditionalContainer = globalContainer.createContainer(
                ContainerType.CONDITIONAL
            );
            conditionalContainer.registerTestProgram(parse('a||b'));
            assert.isEmpty(conditionalContainer.getOwnIdentifiers().sort());
            assert.deepEqual(globalContainer.getOwnIdentifiers().sort(), [
                'a',
                'b',
            ]);
        });
        it('register program and check identifiers on cycle container type', () => {
            const cycleContainer = globalContainer.createContainer(
                ContainerType.CYCLE
            );
            cycleContainer.registerProgram(
                parse('a.init()'),
                ProgramType.FLOAT,
                'data'
            );
            cycleContainer.registerProgram(
                parse('a.test()'),
                ProgramType.FLOAT,
                'data'
            );
            cycleContainer.registerProgram(
                parse('a.update()'),
                ProgramType.FLOAT,
                'data'
            );
            cycleContainer.registerProgram(
                parse('a.value() + b'),
                ProgramType.SIMPLE,
                'simple'
            );
            assert.deepEqual(cycleContainer.getOwnIdentifiers().sort(), ['a']);
            assert.deepEqual(globalContainer.getOwnIdentifiers().sort(), [
                'a',
                'b',
            ]);
        });

        describe('template and partial joining', () => {
            let template: Container;
            let partial: Container;

            beforeEach(() => {
                template = globalContainer.createContainer(
                    ContainerType.TEMPLATE
                );
                partial = globalContainer.createContainer(
                    ContainerType.COMPONENT
                );
                template.registerProgram(
                    parse('a+b'),
                    ProgramType.SIMPLE,
                    null
                );
                template.registerProgram(
                    parse('b+c'),
                    ProgramType.SIMPLE,
                    null
                );
                template.registerProgram(
                    parse('c+d'),
                    ProgramType.SIMPLE,
                    null
                );
                partial.registerProgram(
                    parse('a+d+e'),
                    ProgramType.OPTION,
                    'option'
                );
            });
            afterEach(() => {
                template = null;
                partial = null;
            });

            it('own identifiers before join', () => {
                assert.deepEqual(template.getOwnIdentifiers().sort(), [
                    'a',
                    'b',
                    'c',
                    'd',
                ]);
                assert.deepEqual(partial.getOwnIdentifiers().sort(), []);
                assert.deepEqual(globalContainer.getOwnIdentifiers().sort(), [
                    'a',
                    'b',
                    'c',
                    'd',
                    'e',
                ]);
            });
            it('own identifiers after join', () => {
                partial.joinContainer(template, ['a', 'c']);
                assert.deepEqual(template.getOwnIdentifiers().sort(), [
                    'a',
                    'b',
                    'c',
                    'd',
                ]);
                assert.deepEqual(partial.getOwnIdentifiers().sort(), []);
                assert.deepEqual(globalContainer.getOwnIdentifiers().sort(), [
                    'a',
                    'b',
                    'c',
                    'd',
                    'e',
                ]);
            });
        });

        describe('processing container index', () => {
            /**
             *                            global
             *                   component(1)      template
             *              content_option(1)          cycle(2)
             *          component(2)                       conditional(2)
             *      content_option(2)
             *   conditional(1)
             * cycle(1)
             */
            let component1: Container;
            let contentOption1: Container;
            let component2: Container;
            let contentOption2: Container;
            let conditional1: Container;
            let cycle1: Container;
            let template: Container;
            let cycle2: Container;
            let conditional2: Container;

            beforeEach(() => {
                component1 = globalContainer.createContainer(
                    ContainerType.COMPONENT
                );
                contentOption1 = component1.createContainer(
                    ContainerType.CONTENT_OPTION
                );
                component2 = contentOption1.createContainer(
                    ContainerType.COMPONENT
                );
                contentOption2 = component2.createContainer(
                    ContainerType.CONTENT_OPTION
                );
                conditional1 = contentOption2.createContainer(
                    ContainerType.CONDITIONAL
                );
                cycle1 = conditional1.createContainer(ContainerType.CYCLE);

                template = globalContainer.createContainer(
                    ContainerType.TEMPLATE
                );
                cycle2 = template.createContainer(ContainerType.CYCLE);
                conditional2 = template.createContainer(ContainerType.CYCLE);
            });
            afterEach(() => {
                component1 = null;
                contentOption1 = null;
                component2 = null;
                contentOption2 = null;
                conditional1 = null;
                cycle1 = null;

                template = null;
                cycle2 = null;
                conditional2 = null;
            });

            it('cycle in content option #2', () => {
                assert.strictEqual(
                    cycle1.getProcessingContainerIndex(),
                    contentOption2.index
                );
            });
            it('conditional in content option #2', () => {
                assert.strictEqual(
                    conditional1.getProcessingContainerIndex(),
                    contentOption2.index
                );
            });
            it('content option #2 in component #2', () => {
                assert.strictEqual(
                    contentOption2.getProcessingContainerIndex(),
                    contentOption2.index
                );
            });
            it('component #2 in content option #1', () => {
                assert.strictEqual(
                    component2.getProcessingContainerIndex(),
                    contentOption1.index
                );
            });
            it('content option #1 in component #1', () => {
                assert.strictEqual(
                    contentOption1.getProcessingContainerIndex(),
                    contentOption1.index
                );
            });
            it('component #1 in global', () => {
                assert.strictEqual(
                    component1.getProcessingContainerIndex(),
                    globalContainer.index
                );
            });
            it('conditional in template', () => {
                assert.strictEqual(
                    conditional2.getProcessingContainerIndex(),
                    template.index
                );
            });
            it('cycle in template', () => {
                assert.strictEqual(
                    cycle2.getProcessingContainerIndex(),
                    template.index
                );
            });
            it('template in global', () => {
                assert.strictEqual(
                    template.getProcessingContainerIndex(),
                    template.index
                );
            });
        });
    });

    describe('Tree of internal nodes', () => {
        let globalContainer: Container;
        let component: Container;
        let contentOption: Container;
        let component2: Container;
        let ifNode: Container;
        let elseIfNode: Container;
        let elseNode: Container;

        let globalStandard: IInternalStandard;
        let componentStandard: IInternalStandard;
        let contentOptionStandard: IInternalStandard;
        let component2Standard: IInternalStandard;
        let ifNodeStandard: IInternalStandard;
        let elseIfNodeStandard: IInternalStandard;
        let elseNodeStandard: IInternalStandard;

        beforeEach(() => {
            globalContainer = new Container(null, ContainerType.GLOBAL);
            globalContainer.registerProgram(
                parse('a'),
                ProgramType.SIMPLE,
                null
            );

            component = globalContainer.createContainer(
                ContainerType.COMPONENT
            );
            component.registerProgram(
                parse('b'),
                ProgramType.ATTRIBUTE,
                'attr-b'
            );
            component.registerProgram(parse('c'), ProgramType.OPTION, 'opt-c');

            contentOption = component.createContainer(
                ContainerType.CONTENT_OPTION
            );
            contentOption.addIdentifier('content');

            component2 = contentOption.createContainer(ContainerType.COMPONENT);
            component2.registerProgram(
                parse('d'),
                ProgramType.ATTRIBUTE,
                'attr-d'
            );
            component2.registerProgram(parse('e'), ProgramType.OPTION, 'opt-e');

            contentOption.registerProgram(parse('f'), ProgramType.SIMPLE, null);
            // Намеренный дубликат выражения, который не должен дублироваться в internal-дереве
            contentOption.registerProgram(parse('f'), ProgramType.SIMPLE, null);
            contentOption.registerProgram(
                parse('content.g'),
                ProgramType.SIMPLE,
                null
            );

            ifNode = contentOption.createContainer(ContainerType.CONDITIONAL);
            ifNode.registerTestProgram(parse('testExpr'));
            ifNode.registerProgram(parse('h'), ProgramType.SIMPLE, null);

            elseIfNode = contentOption.createContainer(
                ContainerType.CONDITIONAL
            );
            elseIfNode.registerTestProgram(parse('content.testExpr'));
            elseIfNode.registerProgram(parse('j'), ProgramType.SIMPLE, null);

            elseNode = contentOption.createContainer(ContainerType.CONDITIONAL);
            elseNode.registerProgram(parse('k'), ProgramType.SIMPLE, null);
            elseNode.isElse = true;

            ifNodeStandard = {
                index: ifNode.index,
                isInDataType: ifNode.isInDataType,
                type: InternalNodeType.IF,
                test: 'testExpr',
                storage: ['h'],
                ref: ifNode,
                children: [],
            };
            elseIfNodeStandard = {
                index: elseIfNode.index,
                isInDataType: elseIfNode.isInDataType,
                type: InternalNodeType.ELSE_IF,
                test: 'content.testExpr',
                storage: ['j'],
                ref: elseIfNode,
                children: [],
            };
            elseNodeStandard = {
                index: elseNode.index,
                isInDataType: elseNode.isInDataType,
                type: InternalNodeType.ELSE,
                test: null,
                storage: ['k'],
                ref: elseNode,
                children: [],
            };
            component2Standard = {
                index: component2.index,
                isInDataType: component2.isInDataType,
                type: InternalNodeType.BLOCK,
                test: null,
                storage: ['d', 'e'],
                ref: component2,
                children: [],
            };
            contentOptionStandard = {
                index: contentOption.index,
                isInDataType: contentOption.isInDataType,
                type: InternalNodeType.BLOCK,
                test: null,
                storage: ['f', 'content.g'],
                ref: contentOption,
                children: [
                    component2Standard,
                    ifNodeStandard,
                    elseIfNodeStandard,
                    elseNodeStandard,
                ],
            };
            componentStandard = {
                index: component.index,
                isInDataType: component.isInDataType,
                type: InternalNodeType.BLOCK,
                test: null,
                storage: ['b', 'c'],
                ref: component,
                children: [contentOptionStandard],
            };
            globalStandard = {
                index: globalContainer.index,
                isInDataType: globalContainer.isInDataType,
                type: InternalNodeType.BLOCK,
                test: null,
                storage: ['a'],
                ref: globalContainer,
                children: [componentStandard],
            };
        });
        afterEach(() => {
            globalContainer = null;
            component = null;
            contentOption = null;
            component2 = null;
            ifNode = null;
            elseIfNode = null;
            elseNode = null;
        });

        it('Check tree for global node', () => {
            const actual = globalContainer.getInternalStructure();
            // Выражение content.g удаляется, т.к. не может быть вычислено
            contentOptionStandard.storage = ['f'];
            // Условия преобразуются в блоки
            makeConditionalBlocked(ifNodeStandard);
            makeConditionalBlocked(elseIfNodeStandard, false);
            makeConditionalBlocked(elseNodeStandard);
            assertInternal(actual, globalStandard);
        });
        it('Check tree for ContainerType.COMPONENT', () => {
            const actual = component.getInternalStructure();
            // Контентные опции на компоненте не учитываются для internal,
            // т.к. сама контентная опция хранит выражения для internal
            componentStandard.children = [];
            componentStandard.storage = [];
            assertInternal(actual, globalStandard.children[0]);
        });
        it('Check tree for ContainerType.CONTENT_OPTION', () => {
            const actual = contentOption.getInternalStructure();
            // Выполняется разворот, т.к. условие может быть не вычислено
            elseIfNodeStandard.type = InternalNodeType.IF;
            assertInternal(actual, contentOptionStandard);
        });
    });
});
