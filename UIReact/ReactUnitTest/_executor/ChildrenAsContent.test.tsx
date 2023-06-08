/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import RootReact from './resources/ChldrenAsContent/RootReact';
import WasabySimpleContent from './resources/ChldrenAsContent/WasabySimpleContent';
import WasabyPatchedContent from './resources/ChldrenAsContent/WasabyPatchedContent';
import WasabySimpleContentTemplate = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/WasabySimpleContent');
import WasabyPatchedContentTemplate = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/WasabyPatchedContent');

import MainReact1 from './resources/ChldrenAsContent/MainReact1';
import MainReact2 from './resources/ChldrenAsContent/MainReact2';

async function wait() {
    await act(async () => {
        jest.runOnlyPendingTimers();
    });
}

describe('Children в tsx преобразовывается в content wml', () => {
    let container: HTMLDivElement;
    beforeEach(() => {
        container = document.createElement('div', {});
        document.body.appendChild(container);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('контрол не патчит content', () => {
        act(() => {
            render(
                <RootReact WasabyComponentWithContent={WasabySimpleContent} />,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });

    it('контрол патчит content', () => {
        act(() => {
            render(
                <RootReact WasabyComponentWithContent={WasabyPatchedContent} />,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });

    it('шаблон не патчит content', () => {
        act(() => {
            render(
                <RootReact
                    WasabyComponentWithContent={WasabySimpleContentTemplate}
                />,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });

    it('шаблон патчит content', () => {
        act(() => {
            render(
                <RootReact
                    WasabyComponentWithContent={WasabyPatchedContentTemplate}
                />,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });

    it('не происходит лишних перерисовок 1 (перерисовка по клику происходит и счетчик выводится)', async () => {
        act(() => {
            render(<MainReact1 />, container);
        });
        await wait();

        const button = container.getElementsByTagName('button')[0];

        expect(container).toMatchSnapshot();
        button.click();
        expect(container).toMatchSnapshot();
    });
    it('не происходит лишних перерисовок 2 (перерисовка по клику не происходит)', async () => {
        act(() => {
            render(<MainReact2 />, container);
        });
        await wait();

        const button = container.getElementsByTagName('button')[0];

        expect(container).toMatchSnapshot();
        button.click();
        expect(container).toMatchSnapshot();
    });
});
