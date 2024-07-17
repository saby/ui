/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { createRef } from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { Control } from 'UICore/Base';
import { Activator } from 'UICore/Focus';
import OuterControl from './resources/ChildrenTest/OuterControl';
import InnerControl from './resources/ChildrenTest/InnerControl';
import ControlWithNamedDOMElement from './resources/ChildrenTest/ControlWithNamedDOMElement';
import ControlWithChildren from './resources/ChildrenTest/ControlWithChildren';
import WrapperControl from 'ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/Wrapper';
import Child1Control from 'ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/Child1';
import Child2Control from 'ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/Child2';
import WrapperDeleteControl from 'ReactUnitTest/_base/resources/ChildrenTest/ChildrenRef/WrapperDelete';
import ControlWithReactChildren from 'ReactUnitTest/_base/resources/ChildrenTest/ControlWithReactChildren';
import ChildReactComponent from 'ReactUnitTest/_base/resources/ChildrenTest/ChildReactComponent';
import WasabyWithReactChild from 'ReactUnitTest/_base/resources/ChildrenTest/WmlReactChildren/WasabyWithReactChild';
import ParentNamedPartialHTMLElementContent from 'ReactUnitTest/_base/resources/ChildrenTest/NamedPartialChildren/ParentNamedPartialHTMLElementContent';
import ParentNamedPartialControlContent from 'ReactUnitTest/_base/resources/ChildrenTest/NamedPartialChildren/ParentNamedPartialControlContent';
import ControlWithNamedPartial from 'ReactUnitTest/_base/resources/ChildrenTest/NamedPartialChildren/ControlWithNamedPartial';
import ReactInner from 'ReactUnitTest/_base/resources/ChildrenTest/WmlReactChildren/ReactInner';
import ContentOptionOwner from 'ReactUnitTest/_base/resources/ChildrenTest/NameUpperThenContentOption/ContentOptionOwner';
import ScopeOptionsAsCustomObject from 'ReactUnitTest/_base/resources/ChildrenTest/NameUpperThenContentOption/ScopeOptionsAsCustomObject';
import ReactChild from 'ReactUnitTest/_base/resources/ChildrenTest/WmlReactChildren/ReactChild';
import Wasaby1 from 'ReactUnitTest/_base/Children/Wasaby1';

const creator = Control.createControl;

describe('дочерние контролы', () => {
    let container: HTMLElement;

    /**
     * ожидание выполнения _beforeMount
     */
    function waitBeforeMount(): void {
        act(() => {
            jest.runAllTimers();
        });
    }

    beforeEach(() => {
        jest.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        jest.useRealTimers();
        unmountComponentAtNode(container);
        container.remove();
    });

    it('наличие дочернего контрола', () => {
        let instance;
        act(() => {
            render(
                <OuterControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        waitBeforeMount();

        expect(instance._children.mycontrol instanceof InnerControl).toBe(true);
    });

    it('имя дочернего контрола не прокидывается как атрибут', () => {
        let instance;
        act(() => {
            render(
                <OuterControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        waitBeforeMount();

        const childControl = instance._children.mycontrol;

        // оставляем здесь эту проверку, чтобы не потерять тест в случае переименования mycontrol.
        expect(childControl instanceof InnerControl).toBe(true);
        expect('mycontrol' in childControl._children).toBe(false);
    });

    it('наличие дочернего DOM элемента', () => {
        let instance;
        act(() => {
            render(
                <ControlWithNamedDOMElement
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        waitBeforeMount();

        expect(instance._children.rootElement instanceof HTMLDivElement).toBe(true);
    });

    it('добавляем в _children до beforeMount', () => {
        act(() => {
            creator(
                ControlWithChildren,
                {
                    check: (childName) => {
                        expect(childName).toBe('ReactUnitTest/_base/resources/ChildrenTest/Child');
                    },
                },
                container
            );
        });
        waitBeforeMount();
    });

    test('устанавливается правильный ребенок', () => {
        let instance;
        act(() => {
            render(
                <WrapperControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        waitBeforeMount();

        expect(instance.getChild()._children.MyControl).toBeInstanceOf(Child2Control);
    });

    it('react component с заданным в wml name попадает в _children', () => {
        let instance: ControlWithReactChildren;
        act(() => {
            render(
                <ControlWithReactChildren
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        waitBeforeMount();

        expect(instance.getChildReactComponent()).toBeInstanceOf(ChildReactComponent);
    });

    // Сценарий, когда в wml вставляется React контрол с name, в него в этой же wml вставляется другой контрол.
    // В итоге ребенком должен стать первый контрол, в который непосредственно установили name.
    // Особенность именно в том, что в React контроле при вставке content
    // в него прокидываются все props, в которых есть name
    it('react component с заданным в wml name попадает в _children', () => {
        let instance: WasabyWithReactChild;
        act(() => {
            render(
                <WasabyWithReactChild
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        waitBeforeMount();

        expect(instance.getReactChild()).toBeInstanceOf(ReactChild);
    });

    it('функциональный контрол попадает в children как специальный класс с _container', () => {
        let instance: Wasaby1;
        act(() => {
            render(
                <Wasaby1
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });

        expect(instance._children.react1).toBeInstanceOf(Activator);
        expect(instance._children.react1._container?.id).toBe('reactFnComponentRoot');
    });

    it('Activatoe обновляет _container при обновлении компонента', () => {
        let instance: Wasaby1;
        act(() => {
            render(
                <Wasaby1
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });

        waitBeforeMount();

        expect(instance._children.react1?._container?.tagName).toBe('DIV');

        act(() => {
            fireEvent.click(document.getElementById('reactFnComponentRoot'));
        });

        expect(instance._children.react1?._container?.tagName).toBe('SPAN');
    });

    test('name вешается на ws:partial, в корне контрол', async () => {
        let instance: ParentNamedPartialControlContent;
        act(() => {
            instance = creator(
                ParentNamedPartialControlContent,
                {},
                container
            ) as ParentNamedPartialControlContent;
        });

        await screen.findByText('content Control');

        expect(instance.getControlWithNamedPartial()?.getContentChild()).toBeInstanceOf(
            Child1Control
        );
    });

    test('name вешается на ws:partial, в корне DOM элемент', async () => {
        let instance: ParentNamedPartialHTMLElementContent;
        act(() => {
            instance = creator(
                ParentNamedPartialHTMLElementContent,
                {},
                container
            ) as ParentNamedPartialHTMLElementContent;
        });

        await screen.findByText('content HTMLElement');

        // name на partial работает только с контролом в корне. Зафиксируем это поведение тестом.
        expect(instance.getControlWithNamedPartial()?.getContentChild()).toBe(undefined);
    });

    test('name вешается на ws:partial _options content, который задан как контрол children в tsx', async () => {
        const controlWithNamedPartialRef = createRef<ControlWithNamedPartial>();
        function TestComponent() {
            return (
                <div className="testComponent">
                    <ControlWithNamedPartial ref={controlWithNamedPartialRef}>
                        <Child1Control>
                            <div className="testContent">content Control</div>
                        </Child1Control>
                    </ControlWithNamedPartial>
                </div>
            );
        }

        act(() => {
            render(<TestComponent />, container);
        });

        await screen.findByText('content Control');
        expect(controlWithNamedPartialRef.current?.getContentChild()).toBeInstanceOf(Child1Control);
    });

    test('name вешается на ws:partial _options content, который задан как классовый компонент children в tsx', async () => {
        const controlWithNamedPartialRef = createRef<ControlWithNamedPartial>();
        function TestComponent() {
            return (
                <div className="testComponent">
                    <ControlWithNamedPartial ref={controlWithNamedPartialRef}>
                        <ReactInner forwardedRef={() => {}} />
                    </ControlWithNamedPartial>
                </div>
            );
        }

        act(() => {
            render(<TestComponent />, container);
        });

        await screen.findByText('inner react');
        expect(controlWithNamedPartialRef.current?.getContentChild()).toBeInstanceOf(ReactInner);
    });

    test.only('name вешается на ws:partial _options content, который задан как DOM children в tsx', async () => {
        const controlWithNamedPartialRef = createRef<ControlWithNamedPartial>();
        function TestComponent() {
            return (
                <div className="testComponent">
                    <ControlWithNamedPartial ref={controlWithNamedPartialRef}>
                        <div className="testContent">content HTMLElement</div>
                    </ControlWithNamedPartial>
                </div>
            );
        }

        act(() => {
            render(<TestComponent />, container);
        });

        await screen.findByText('content HTMLElement');
        expect(controlWithNamedPartialRef.current?.getContentChild()).toBeInstanceOf(
            HTMLDivElement
        );
    });

    test('name не должен прокидываться через скоуп-объект в контролы внутри контентной опции', async () => {
        let instance: ContentOptionOwner;
        act(() => {
            instance = creator(ContentOptionOwner, {}, container) as ContentOptionOwner;
        });
        await screen.findByText('Content Option Control');
        expect(instance?.getContentOptionUser()?.getChild()).toBeInstanceOf(
            ScopeOptionsAsCustomObject
        );
    });

    test('ребенок удаляется из _children', () => {
        let instance: WrapperDeleteControl;
        act(() => {
            render(
                <WrapperDeleteControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });

        waitBeforeMount();

        expect(instance.getChild()).toBeInstanceOf(Child2Control);

        act(() => {
            instance.hideChild();
        });

        // UICommon\_executor\_Utils\ChildrenManager.asyncPurifyTimeout = 1000,
        // поэтому ждём прохождения всех таймеров
        jest.runAllTimers();

        expect(instance.getChild()).toBeUndefined();
    });
});