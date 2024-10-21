/**
 * @jest-environment jsdom
 */
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import IndexControl from 'ReactUnitTest/ContentOptions/resources/Index';

describe('Контентные опции', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        container.remove();
    });

    /**
     * Cценарий, когда в контрол в опциях передается другой контрол и опции для него.<br/>
     * При этом после _forceUpdate родителя эти опции должны остаться теми же по ссылке.
     */
    it('Конетная опция не поменялась после _forceUpdate', () => {
        let instance;
        act(() => {
            render(
                <IndexControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });

        expect(container).toMatchSnapshot('1.построилось');

        act(() => {
            instance._children.parent._forceUpdate();
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot('2.после _forceUpdate');
    });
});
