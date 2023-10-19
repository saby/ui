import type { ProgramNode } from 'Compiler/_compiler/expressions/Nodes';

import { ProgramsContainer, ContainerType, ProgramType } from 'Compiler/_compiler/core/IRInternal';
import { Parser } from 'Compiler/_compiler/expressions/Parser';

interface IExpression {
    statement: string;
    type: ProgramType;
}

interface IDescription {
    type: ContainerType;
    identifiers?: string[];
    expressions?: IExpression[];
    children?: IDescription[];
}

function toProgramString(programs: ProgramNode[]) {
    return programs.map(program => program.string);
}

describe('Compiler/_compiler/core/IRInternal', () => {
    let global;
    let referenceId;
    const parser = new Parser();

    function process(parent: ProgramsContainer, descriptions: IDescription[]) {
        descriptions.forEach((description) => {
            const container = parent.spawn(description.type);

            if (description.identifiers) {
                description.identifiers.forEach((identifier) => {
                    container.registerIdentifier(identifier);
                });
            }

            if (description.expressions) {
                description.expressions.forEach((expression) => {
                    const program = parser.parse(expression.statement);
                    program.referenceId = referenceId++;

                    container.registerProgram(program, expression.type);
                });
            }

            if (description.children) {
                process(container, description.children);
            }
        });
    }

    beforeEach(() => {
        global = new ProgramsContainer(ContainerType.GLOBAL);
        referenceId = 0;
    });

    it('should include only component bind expression', () => {
        process(global, [{
            type: ContainerType.COMPONENT,
            expressions: [{
                statement: 'attributeValue',
                type: ProgramType.ATTRIBUTE
            }, {
                statement: 'a.b.c.bindValue',
                type: ProgramType.BIND
            }, {
                statement: 'optionValue',
                type: ProgramType.OPTION
            }, {
                statement: 'd.e.f.handler("literal", g, h.i)',
                type: ProgramType.EVENT
            }]
        }]);

        const component = global.children[0];
        expect(component.type).toEqual(ContainerType.COMPONENT);

        const internalsMeta = component.getInternalsMeta();
        expect(toProgramString(internalsMeta.include)).toEqual([
            'a.b.c',
            'a.b.c.bindValue'
        ]);
        expect(internalsMeta.exclude).toEqual([]);
    });
    it('should exclude iterator expressions and include their identifiers', () => {
        process(global, [{
            type: ContainerType.ITERATOR,
            expressions: [{
                statement: 'init()',
                type: ProgramType.ITERATOR
            }, {
                statement: 'test()',
                type: ProgramType.ITERATOR
            }, {
                statement: 'update()',
                type: ProgramType.ITERATOR
            }]
        }]);

        const iterator = global.children[0];
        expect(iterator.type).toEqual(ContainerType.ITERATOR);

        const internalsMeta = iterator.getInternalsMeta();
        expect(toProgramString(internalsMeta.include)).toEqual([
            'init',
            'test',
            'update'
        ]);
        expect(internalsMeta.exclude).toEqual([
            0, 1, 2
        ]);
    });
    it('should exclude iterator expressions and include their identifiers 2', () => {
        process(global, [{
            type: ContainerType.ITERATOR,
            expressions: [{
                statement: 'iterator.init()',
                type: ProgramType.ITERATOR
            }, {
                statement: 'iterator.test()',
                type: ProgramType.ITERATOR
            }, {
                statement: 'iterator.update()',
                type: ProgramType.ITERATOR
            }]
        }]);

        const iterator = global.children[0];
        expect(iterator.type).toEqual(ContainerType.ITERATOR);

        const internalsMeta = iterator.getInternalsMeta();
        expect(toProgramString(internalsMeta.include)).toEqual([
            'iterator'
        ]);
        expect(internalsMeta.exclude).toEqual([
            0, 1, 2
        ]);
    });
    it('should exclude expression with intersection', () => {
        process(global, [{
            type: ContainerType.ITERATOR,
            identifiers: ['iterator'],
            expressions: [{
                statement: 'collection',
                type: ProgramType.REGULAR
            }, {
                statement: 'iterator.getValue()',
                type: ProgramType.REGULAR
            }, {
                statement: 'iterator.getIndex() < index',
                type: ProgramType.REGULAR
            }, {
                statement: 'statement',
                type: ProgramType.REGULAR
            }]
        }]);

        const iterator = global.children[0];
        expect(iterator.type).toEqual(ContainerType.ITERATOR);

        const internalsMeta = iterator.getInternalsMeta();
        expect(toProgramString(internalsMeta.include)).toEqual([
            'index'
        ]);
        expect(internalsMeta.exclude).toEqual([
            1, 2
        ]);
    });
});
