/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import CallRefsAfterUp from './_ref-container/CallRefsAfterUp';
import ContainerRefControl from './_ref-container/ContainerRefControl';
import InlineOptRoot from './_ref-container/InlineOptRoot';
import ResetContainerRoot from './_ref-container/ResetContainerRoot';

describe('Проброс CreateHocRef', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.useFakeTimers();
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('Вызов цепочки после перерисовки контрола', async () => {
        let rootComponent;
        act(() => {
            render(
                <CallRefsAfterUp
                    ref={(v) => {
                        rootComponent = v;
                    }}
                />,
                container
            );
        });
        const firstContainer = rootComponent.getContainer();
        jest.runOnlyPendingTimers();

        await act(async () => {
            return Promise.resolve();
        });
        expect(firstContainer).not.toBe(rootComponent.getContainer());
    });

    it('Установка _container на корневом элементе шаблона', async () => {
        let rootComponent;
        act(() => {
            render(
                <ContainerRefControl
                    ref={(v) => {
                        rootComponent = v;
                    }}
                />,
                container
            );
        });

        const firstContainer = rootComponent.getContainer();
        jest.runOnlyPendingTimers();

        await act(async () => {
            await Promise.resolve();
        });
        const secondContainer = rootComponent.getContainer();

        expect(firstContainer.id).not.toBe('1');
        expect(secondContainer.id).toBe('1');
    });

    it('Установка _container на контентную inline-опцию', () => {
        let rootComponent;
        act(() => {
            render(
                <InlineOptRoot
                    ref={(v) => {
                        rootComponent = v;
                    }}
                />,
                container
            );
        });
        const domNode = rootComponent.getContainer();

        expect(domNode.id).toBe('inlineContainer');
    });

    it('Актуализация _container, если после перерисовки в корне вместо DOM элемента рисуется контрол', async () => {
        let rootComponent: ResetContainerRoot;
        act(() => {
            render(
                <ResetContainerRoot
                    ref={(v) => {
                        rootComponent = v;
                    }}
                />,
                container
            );
        });
        await act(async () => {
            await Promise.resolve();
        });

        const childContainer = rootComponent.getChildContainer();
        expect(childContainer.tagName).toBe('DIV');

        rootComponent.toggleGrandchildControl();
        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();

        const childContainerAfterReset = rootComponent.getChildContainer();
        expect(childContainerAfterReset.tagName).toBe('SPAN');
    });
});
