/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { createRef, useState } from 'react';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import RootReact from './resources/ChildrenAsContent/RootReact';
import RootReactForwardingRef from './resources/ChildrenAsContent/RootReactForwardingRef';
import RootReactCallbackAndWasabyEvent from './resources/ChildrenAsContent/RootReactCallbackAndWasabyEvent';
import ReactComponentWithClassName from './resources/ChildrenAsContent/ReactComponentWithClassName';
import ReactComponentWithAnotherOption from './resources/ChildrenAsContent/ReactComponentWithAnotherOption';
import WasabySimpleContent from './resources/ChildrenAsContent/WasabySimpleContent';
import WasabyPatchedContent from './resources/ChildrenAsContent/WasabyPatchedContent';
import WasabyContentInRoot from './resources/ChildrenAsContent/WasabyContentInRoot';
import WasabyProxyContentWithNewPartial from './resources/ChildrenAsContent/WasabyProxyContentWithNewPartial';
import WasabyProxyContent from './resources/ChildrenAsContent/WasabyProxyContent';
import WasabySimpleContentTemplate = require('wml!ReactUnitTest/_executor/resources/ChildrenAsContent/WasabySimpleContent');
import WasabyPatchedContentTemplate = require('wml!ReactUnitTest/_executor/resources/ChildrenAsContent/WasabyPatchedContent');

import WasabyInWasaby from './resources/ChildrenAsContent/WasabyInWasaby';

import MainReact1 from './resources/ChildrenAsContent/MainReact1';
import MainReact2 from './resources/ChildrenAsContent/MainReact2';

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

    it('контрол прокидывает content дальше, content перерисовывается при смене children', async () => {
        const user = userEvent.setup({
            delay: undefined,
        });
        function RootWrapper() {
            const [contentClassName, setContentClassName] = useState<'first' | 'second'>('first');
            return (
                <div data-qa="changeTagOnClick" onClick={() => setContentClassName('second')}>
                    <RootReact
                        WasabyComponentWithContent={WasabyProxyContentWithNewPartial}
                        contentClassName={contentClassName}
                    />
                </div>
            );
        }

        act(() => {
            render(<RootWrapper />, container);
        });
        expect(container).toMatchSnapshot('1. before click');

        const divToClick = await screen.findByTestId('changeTagOnClick');
        await user.click(divToClick);
        expect(container).toMatchSnapshot('2. after click');
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

    it('children прокомментирован', () => {
        function RootReactCommentChildren(): JSX.Element {
            return (
                <div className="rootReactCommentChildren">
                    <WasabyContentInRoot>
                        {
                            null /* Если только комментарий, он удаляется при компиляции. Но пропуск пустоты всё равно стоит поддержать */
                        }
                        {<div className="afterCommentChild">child</div>}
                    </WasabyContentInRoot>
                </div>
            );
        }

        act(() => {
            render(<RootReactCommentChildren />, container);
        });
        expect(container).toMatchSnapshot();
    });

    it('children прокомментирован, компиляция через createElement', () => {
        function RootReactCommentChildren(): JSX.Element {
            return (
                <div className="rootReactCommentChildren">
                    <WasabyContentInRoot {...{}} key="compileToCreateElement">
                        {
                            null /* Если только комментарий, он удаляется при компиляции. Но пропуск пустоты всё равно стоит поддержать */
                        }
                        {<div className="afterCommentChildByCreateElement">child</div>}
                    </WasabyContentInRoot>
                </div>
            );
        }

        act(() => {
            render(<RootReactCommentChildren />, container);
        });
        expect(container).toMatchSnapshot();
    });

    it('children - массив, контент не в корне контрола', () => {
        function RootReactArrayChildren(): JSX.Element {
            return (
                <div className="rootReactArrayChildren">
                    <WasabySimpleContent>
                        <div className="firstChild">child 1</div>
                        <div className="secondChild">child 2</div>
                    </WasabySimpleContent>
                </div>
            );
        }

        act(() => {
            render(<RootReactArrayChildren />, container);
        });
        expect(container).toMatchSnapshot();
    });

    it('Wasaby не может заменить колбек событием', async () => {
        const wasabyEventHandler = jest.fn();
        const reactCallbackHandler = jest.fn();
        // Сочетание delay 0 и jest.useFakeTimers() вызывает бесконечный клик.
        const user = userEvent.setup({
            delay: undefined,
        });
        act(() => {
            render(
                <RootReactCallbackAndWasabyEvent
                    wasabyEventHandler={wasabyEventHandler}
                    reactCallbackHandler={reactCallbackHandler}
                />,
                container
            );
        });
        const divToClick = screen.queryByText('reactWithItemClickCallback') as HTMLDivElement;
        await user.click(divToClick);
        expect(wasabyEventHandler).not.toBeCalled();
        expect(reactCallbackHandler).toBeCalled();
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
        expect((wasabyForwardedRef.current as HTMLDivElement).classList).toContain(
            contentClassName
        );
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
        expect((wasabyForwardedRef.current as HTMLDivElement).classList).toContain(
            contentClassName
        );
        expect(contentForwardedRef.current).toBe(wasabyForwardedRef.current);
    });

    it('Происходит склейка className когда контент это реакт компонент', () => {
        act(() => {
            render(
                <RootReact
                    WasabyComponentWithContent={WasabyPatchedContent}
                    Content={ReactComponentWithClassName}
                />,
                container
            );
        });
        expect(container).toMatchSnapshot('должны склеиться классы patchedClass и content');
    });

    it('пропсы из логического родителя в приоритете перед опциями контента', () => {
        act(() => {
            render(
                <WasabyPatchedContent>
                    <ReactComponentWithAnotherOption anotherOption="tsx value" />
                </WasabyPatchedContent>,
                container
            );
        });
        expect(container).toMatchSnapshot('anotherOption не перетирается в wml');
    });

    it('tsx вставляет Wasaby в Wasaby', () => {
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
        act(() => {
            button.click();
        });
        expect(container).toMatchSnapshot();
    });

    it('не происходит лишних перерисовок 2 (перерисовка по клику не происходит)', async () => {
        act(() => {
            render(<MainReact2 />, container);
        });
        await wait();

        const button = container.getElementsByTagName('button')[0];

        expect(container).toMatchSnapshot();
        act(() => {
            button.click();
        });
        expect(container).toMatchSnapshot();
    });
});
