/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Control, IControlOptions } from 'UI/Base';
import WasabyReactFn from './ForwardedRef/ReactFn/WasabyReactFn';
import WasabyReactClass from './ForwardedRef/ReactClass/WasabyReactClass';
import WasabyWrapper from './ForwardedRef/Wrapper/WasabyWrapper';

interface IOptions extends IControlOptions {
    contentOption?: boolean;
}

describe('ForwardedRef', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.useFakeTimers();
    });

    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    // Wasaby контрол, который вставляет функциональный react компонент
    test('Wasaby > ReactFn', () => {
        act(() => {
            Control.createControl(WasabyReactFn, {}, container);
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot();
    });

    // Wasaby контрол, который вставляет функциональный react компонент,
    // в который в content вставляется другой функциональный react компонент
    test('Wasaby > ReactFn > content ReactFn', async () => {
        act(() => {
            Control.createControl<IOptions, HTMLDivElement>(
                WasabyReactFn,
                { contentOption: true },
                container
            );
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot();
    });

    // Wasaby контрол, который вставляет классовый react компонент
    test('Wasaby > ReactClass', () => {
        act(() => {
            Control.createControl(WasabyReactClass, {}, container);
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot();
    });

    // Wasaby контрол, который вставляет классовый react компонент,
    // в который в content вставляется другой классовый react компонент
    test('Wasaby > ReactClass > content ReactClass', () => {
        act(() => {
            Control.createControl<IOptions, HTMLDivElement>(
                WasabyReactClass,
                { contentOption: true },
                container
            );
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot();
    });

    test('Wasaby > Wasaby_React wrapper > Wasaby_React wrapper > Wasaby', () => {
        act(() => {
            Control.createControl<IOptions, HTMLDivElement>(
                WasabyWrapper,
                {},
                container
            );
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot();
    });

    test('Wasaby > Wasaby_React wrapper > Wasaby_React wrapper > content', () => {
        act(() => {
            Control.createControl<IOptions, HTMLDivElement>(
                WasabyWrapper,
                { contentOption: true },
                container
            );
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot();
    });
});
