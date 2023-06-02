/**
 * @jest-environment jsdom
 */
import { act } from 'react-dom/test-utils';
import { Control } from 'UICore/Base';

import WasabyRoot from './resources/ReactComponent/WasabyRoot';

const creator = Control.createControl;

describe('Определение типа компонента', () => {
    let container: HTMLDivElement;

    /**
     * Эта функция существует для того, чтобы не забывать оборачивать тики в act.
     * Это нужно, чтобы реакт реагировал на изменение времени и обновлял компоненты.
     * @param duration Значение, на которое должно продвинуться время.
     */
    function tick(duration: number): void {
        act(() => {
            jest.advanceTimersByTime(duration);
        });
    }

    beforeEach(() => {
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        jest.useFakeTimers();

        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        jest.useRealTimers();
        container.remove();
    });

    it('Functional Component', async () => {
        // region Setup
        act(() => {
            creator(WasabyRoot, { reactFunction: true }, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });

    it('React Component', async () => {
        // region Setup
        act(() => {
            creator(WasabyRoot, { reactComponent: true }, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });

    it('React Component, наследник другого React Component', async () => {
        // region Setup
        act(() => {
            creator(WasabyRoot, { extendedReactComponent: true }, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });

    it('React Component, обёрнутый в memo', async () => {
        // region Setup
        act(() => {
            creator(WasabyRoot, { memoizedReactComponent: true }, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });

    it('React PureComponent', async () => {
        // region Setup
        act(() => {
            creator(WasabyRoot, { reactPureComponent: true }, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });

    it('Wasaby Controls', async () => {
        // region Setup
        act(() => {
            creator(WasabyRoot, { wasabyControl: true }, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });

    it('Wasaby Controls with content', async () => {
        // region Setup
        act(() => {
            creator(WasabyRoot, { wasabyControlContent: true }, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });

    it('Вставка forwardRef в wasaby', async () => {
        // region Setup
        act(() => {
            creator(WasabyRoot, { withForwardRef: true }, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });
});
