/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { createRef } from 'react';
import { act } from 'react-dom/test-utils';

import RootReact from './resources/ChldrenAsContent/RootReact';
import RootReactForwardingRef from './resources/ChldrenAsContent/RootReactForwardingRef';
import WasabySimpleContent from './resources/ChldrenAsContent/WasabySimpleContent';
import WasabyPatchedContent from './resources/ChldrenAsContent/WasabyPatchedContent';
import WasabyProxyContent from './resources/ChldrenAsContent/WasabyProxyContent';
import WasabySimpleContentTemplate = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/WasabySimpleContent');
import WasabyPatchedContentTemplate = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/WasabyPatchedContent');

import WasabyInWasaby from './resources/ChldrenAsContent/WasabyInWasaby';

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
        jest.useFakeTimers();
        container = document.createElement('div', {});
        document.body.appendChild(container);
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.useRealTimers();
    });

    it('контрол не патчит content', () => {
        act(() => {
            render(<RootReact WasabyComponentWithContent={WasabySimpleContent} />, container);
        });
        expect(container).toMatchSnapshot();
    });

    it('контрол прокидывает content дальше', () => {
        act(() => {
            render(<RootReact WasabyComponentWithContent={WasabyProxyContent} />, container);
        });
        expect(container).toMatchSnapshot();
    });

    it('контрол патчит content', () => {
        act(() => {
            render(<RootReact WasabyComponentWithContent={WasabyPatchedContent} />, container);
        });
        expect(container).toMatchSnapshot();
    });

    it('шаблон не патчит content', () => {
        act(() => {
            render(
                <RootReact WasabyComponentWithContent={WasabySimpleContentTemplate} />,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });

    it('шаблон патчит content', () => {
        act(() => {
            render(
                <RootReact WasabyComponentWithContent={WasabyPatchedContentTemplate} />,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });

    it('Объединение ref, в Wasaby вставляется Wasaby', () => {
        const wasabyForwardedRef = createRef<HTMLDivElement>();
        const contentForwardedRef = createRef<HTMLDivElement>();
        const contentClassName = 'contentWithRef';
        act(() => {
            render(
                <RootReactForwardingRef
                    wasabyContentType="WasabyControl"
                    wasabyForwardedRef={wasabyForwardedRef}
                    contentForwardedRef={contentForwardedRef}
                    contentClassName={contentClassName}
                />,
                container
            );
        });
        expect(container).toMatchSnapshot('Проверка вёрстки');

        expect(wasabyForwardedRef.current).toBeTruthy();
        expect(wasabyForwardedRef.current.classList).toContain(contentClassName);
        expect(contentForwardedRef.current).toBe(wasabyForwardedRef.current);
    });

    it('Объединение ref, в Wasaby вставляется HTMLElement', () => {
        const wasabyForwardedRef = createRef<HTMLDivElement>();
        const contentForwardedRef = createRef<HTMLDivElement>();
        const contentClassName = 'contentWithRef';
        act(() => {
            render(
                <RootReactForwardingRef
                    wasabyContentType="HTMLElement"
                    wasabyForwardedRef={wasabyForwardedRef}
                    contentForwardedRef={contentForwardedRef}
                    contentClassName={contentClassName}
                />,
                container
            );
        });
        expect(container).toMatchSnapshot('Проверка вёрстки');

        expect(wasabyForwardedRef.current).toBeTruthy();
        expect(wasabyForwardedRef.current.classList).toContain(contentClassName);
        expect(contentForwardedRef.current).toBe(wasabyForwardedRef.current);
    });

    // TODO расскипать после решения https://online.sbis.ru/opendoc.html?guid=f821e558-e4fa-4593-bbdc-3c7b7654169f&client=3
    it.skip('tsx вставляет Wasaby в Wasaby', () => {
        act(() => {
            render(<WasabyInWasaby />, container);
        });
        expect(container).toMatchSnapshot('Мержатся все 4 класса, объявленные на всех уровнях');
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
