/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom';
import RootDownChlidren from './_proxyChildren/RootDownChlidren';

describe('ProxyChildren', () => {
    let container: HTMLElement;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        container.remove();
    });

    test('Нет спама варнингами, если _children прокидывают в дочерний шаблон или контрол', async () => {
        const warnSpy = jest.spyOn(console, 'warn');
        let resolveAfterMount: (instance: RootDownChlidren) => void;
        const promise = new Promise<RootDownChlidren>((resolve) => {
            resolveAfterMount = resolve;
        });
        act(() => {
            render(<RootDownChlidren resolveAfterMount={resolveAfterMount} />, container);
        });

        const instance = await promise;
        act(() => {
            instance.upValue();
        });
        await screen.findByText('value is 2');

        expect(container).toMatchSnapshot();
        expect(warnSpy).not.toHaveBeenCalled();
    });
});
