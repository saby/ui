/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';

import { createSandbox, SinonSandbox } from 'sinon';
import { act } from 'react-dom/test-utils';
import { delay } from 'Types/function';

import { Control } from 'UICore/Base';

import ControlBase64, { styles } from './resources/Base64Test/ControlBase64';

import ControlSVG from './resources/SvgTest/ControlSVG';
import InvalidStyleControl from './resources/InvalidStyleTest/InvalidStyleControl';
import IeStyleTest from './resources/StyleTest/IeStyleTest';
import NormalStyleTest from './resources/StyleTest/NormalStyleTest';
import DataComponentRoot from './resources/DataComponent/DataComponentRoot';
import WmlAttrsWasabyRoot from './resources/WmlAttrs/WasabyRoot';

const creator = Control.createControl;

describe('Markup attributes', () => {
    let errors = [];
    const mockedError = (output) => {
        return errors.push(output);
    };
    let container;
    let sandbox: SinonSandbox;
    let clock;

    beforeEach(() => {
        sandbox = createSandbox();
        clock = sandbox.useFakeTimers();
        sandbox.stub(console, 'error').callsFake(mockedError);
        sandbox.stub(window, 'requestAnimationFrame').callsFake(setTimeout);
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        errors = [];
        clock.restore();
        sandbox.restore();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    function tick(duration: number): void {
        act(() => {
            clock.tick(duration);
        });
    }

    async function tickWasabyUpdate(): Promise<void> {
        return act(async () => {
            await Promise.resolve();

            // За время requestAnimationFrame отвечает jsdom.
            // Можно было бы с запасом сделать clock.tick(100), но так точнее.
            await new Promise<void>((resolve) => {
                let resolved: boolean = false;
                // forceUpdate занимает 2 delay
                delay(() => {
                    delay(() => {
                        resolved = true;
                        resolve();
                    });
                });
                while (!resolved) {
                    clock.tick(1);
                }
            });
        });
    }

    it('Построение svg с xlink:href', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(ControlSVG, {}, container);
        });
        tick(0);
        // endregion

        const numberOfMatches = errors.filter((x) => {
            return x.indexOf('Invalid DOM property') > -1;
        }).length;
        expect(numberOfMatches).toBe(0);
    });

    it('Валидация строки style', async () => {
        // region Setup

        // Chrome и IE не присваивает невалидные значения CSSStyleDeclaration, jsdom - присваивает.
        // Мокнем конкретный сценарий.
        sandbox
            .stub(CSSStyleDeclaration.prototype, 'maxWidth')
            .get(function getMaxWidth(): string {
                return this.maxWidthValue || '';
            })
            .set(function setMaxWidth(a: string): void {
                if (a === 'px') {
                    return;
                }
                this.maxWidthValue = a;
            });
        let instance: InvalidStyleControl;
        act(() => {
            instance = creator(InvalidStyleControl, {}, container);
        });
        await tickWasabyUpdate();

        // endregion

        instance.resetMaxWidth();
        tick(2);
        expect(container).toMatchSnapshot();
    });

    it('Валидация строки style ie', async () => {
        // region Setup

        let instance: IeStyleTest;
        act(() => {
            instance = creator(IeStyleTest, {}, container);
        });
        await tickWasabyUpdate();

        // endregion
        tick(2);
        expect(container).toMatchSnapshot();
    });

    it('Валидация строки style normal', async () => {
        // region Setup
        let instance: NormalStyleTest;
        act(() => {
            instance = creator(NormalStyleTest, {}, container);
        });
        await tickWasabyUpdate();

        // endregion
        tick(2);
        expect(container).toMatchSnapshot();
    });

    it('Строка style c base64 внутри', () => {
        // region Setup
        let instance: ControlBase64;
        act(() => {
            instance = creator(ControlBase64, {}, container) as ControlBase64;
        });
        tick(0);
        // endregion

        /** На конечном DOM элементе стили должны быть с base64 */
        expect(instance._children.onlyBase64.style.backgroundImage).toBe(
            styles.backgroundImage
        );

        expect(instance._children.otherPropBeforeBase64.style.color).toBe(
            styles.color
        );
        expect(
            instance._children.otherPropBeforeBase64.style.backgroundImage
        ).toBe(styles.backgroundImage);

        expect(
            instance._children.otherAfterBeforeBase64.style.backgroundImage
        ).toBe(styles.backgroundImage);
        expect(instance._children.otherAfterBeforeBase64.style.color).toBe(
            styles.color
        );

        expect(instance._children.otherPropsAroundBase64.style.color).toBe(
            styles.color
        );
        expect(
            instance._children.otherPropsAroundBase64.style.backgroundImage
        ).toBe(styles.backgroundImage);
        expect(instance._children.otherPropsAroundBase64.style.margin).toBe(
            styles.margin
        );
    });

    it('data-component ставиться на корректный div', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(DataComponentRoot, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();
    });
});

describe('attr: в wml', () => {
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
        unmountComponentAtNode(container);
        container.remove();
        jest.restoreAllMocks();
    });

    test('react function attr:data-qa', () => {
        act(() => {
            creator(WmlAttrsWasabyRoot, { dataQaFn: true }, container);
        });

        expect(container).toMatchSnapshot();
    });

    test('react component attr:data-qa', () => {
        act(() => {
            creator(WmlAttrsWasabyRoot, { dataQaCls: true }, container);
        });

        expect(container).toMatchSnapshot();
    });
});
