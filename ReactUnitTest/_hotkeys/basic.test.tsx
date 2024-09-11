/**
 * @jest-environment jsdom
 */
import { Storage } from 'UICore/_adaptive/Aspects';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Bootstrap from 'UI/Bootstrap';
import Main1 from './Main1';
import Main2 from './Main2';
import Main3 from './Main3';
import Main4 from './Main4';
import { fireEvent } from '@testing-library/react';
import { createRef } from 'react';

describe('HotKeys', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        Storage.getInstance()._clear();
        unmountComponentAtNode(container);
        container.remove();
        document.body.removeAttribute('style');
        Storage.getInstance()._clear();
        jest.restoreAllMocks();
    });

    test('basic', () => {
        act(() => {
            render(
                <Bootstrap>
                    <div className="mainDiv">
                        <div className="unit-test-input"></div>
                        <Main1 />
                    </div>
                </Bootstrap>,
                container
            );
        });
        const input = container.querySelector('.unit-test-input');
        if (input) {
            fireEvent.keyDown(input, {
                which: 13,
            });
        }
        expect(container.querySelector('.mainDiv')).toMatchSnapshot();
    });
    test('родительский контрол перерисовывается', () => {
        const ref = createRef();
        act(() => {
            render(
                <Bootstrap>
                    <div className="mainDiv">
                        <div className="unit-test-input"></div>
                        <Main2 ref={ref} />
                    </div>
                </Bootstrap>,
                container
            );
        });
        ref.current.setClassName('abc');
        const input = container.querySelector('.unit-test-input');
        if (input) {
            fireEvent.keyDown(input, {
                which: 13,
            });
        }
        expect(container.querySelector('.mainDiv')).toMatchSnapshot();
    });

    test('родительский контрол пересоздается', () => {
        const ref = createRef();
        act(() => {
            render(
                <Bootstrap>
                    <div className="mainDiv">
                        <div className="unit-test-input"></div>
                        <Main3 ref={ref} />
                    </div>
                </Bootstrap>,
                container
            );
        });
        ref.current.setContainer('article');
        const input = container.querySelector('.unit-test-input');
        if (input) {
            fireEvent.keyDown(input, {
                which: 13,
            });
        }
        expect(container.querySelector('.mainDiv')).toMatchSnapshot();
    });
    test('комплексный тест - 2 пересоздающихся соседа', () => {
        const ref1 = createRef();
        const ref2 = createRef();
        act(() => {
            render(
                <Bootstrap>
                    <div className="mainDiv">
                        <div className="unit-test-input"></div>
                        <Main3 ref={ref1} />
                        <Main3 ref={ref2} />
                    </div>
                </Bootstrap>,
                container
            );
        });

        ref1.current.setContainer('article');
        ref2.current.setContainer('article');
        ref1.current.setContainer('div');
        ref2.current.setContainer('div');
        // ref2.current.setContainer('article');
        const input = container.querySelector('.unit-test-input');
        fireEvent.keyDown(input, { which: 13 });
        expect(container.querySelector('.mainDiv')).toMatchSnapshot('complex');
    });
    test('комплексный тест - перерисовывающийся и пересоздающийся соседи', () => {
        const ref1 = createRef();
        const ref2 = createRef();
        act(() => {
            render(
                <Bootstrap>
                    <div className="mainDiv">
                        <div className="unit-test-input"></div>
                        <Main2 ref={ref1} />
                        <Main3 ref={ref2} />
                    </div>
                </Bootstrap>,
                container
            );
        });

        ref1.current.setClassName('abc');
        ref2.current.setContainer('article');
        ref1.current.setClassName('abc2');
        ref2.current.setContainer('div');
        // ref2.current.setContainer('article');
        const input = container.querySelector('.unit-test-input');
        fireEvent.keyDown(input, { which: 13 });
        expect(container.querySelector('.mainDiv')).toMatchSnapshot('complex');
    });
    test('комплексный тест - первый сосед пропадает, второй должен перехватить инициативу', () => {
        const ref1 = createRef();
        const ref2 = createRef();
        act(() => {
            render(
                <Bootstrap>
                    <div className="mainDiv">
                        <div className="unit-test-input"></div>
                        <Main4 ref={ref1} />
                        <Main3 ref={ref2} />
                    </div>
                </Bootstrap>,
                container
            );
        });

        ref1.current.setContainer('article');
        const input = container.querySelector('.unit-test-input');
        fireEvent.keyDown(input, { which: 13 });
        expect(container.querySelector('.mainDiv')).toMatchSnapshot('complex');
    });
});
