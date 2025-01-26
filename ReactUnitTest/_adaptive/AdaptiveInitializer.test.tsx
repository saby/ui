/**
 * @jest-environment jsdom
 */
import { Storage } from 'UICore/_adaptive/Aspects';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Main1 from './AdaptiveInitializer/Main1';
import Main2 from './AdaptiveInitializer/Main2';
import Main3 from './AdaptiveInitializer/Main3';
import { Control } from 'UI/Base';

describe('AdaptiveInitializer', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        Storage.getInstance()._clear();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        document.body.removeAttribute('style');
        Storage.getInstance()._clear();
        jest.restoreAllMocks();
    });

    test('isPhoneForced = true', () => {
        act(() => {
            render(<Main1 />, container);
        });
        expect(document.body).toMatchSnapshot();
    });

    test('isPhoneForced = false', () => {
        act(() => {
            render(<Main2 />, container);
        });
        expect(document.body).toMatchSnapshot();
    });

    test('without isPhoneForced', () => {
        act(() => {
            render(<Main3 />, container);
        });
        expect(document.body).toMatchSnapshot();
    });
});

describe('AdaptiveInitializer with special domElementWithSizes', () => {
    let container: HTMLDivElement;
    let mainContainer: HTMLDivElement;

    beforeEach(() => {
        Storage.getInstance()._clear();
        mainContainer = document.createElement('div');
        mainContainer.setAttribute('style', 'width:1000px;height:1000px;');
        container = document.createElement('div');
        mainContainer.appendChild(container);
        document.body.appendChild(mainContainer);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        mainContainer.remove();
        container = null;
        mainContainer = null;
        document.body.removeAttribute('style');
        Storage.getInstance()._clear();
        jest.restoreAllMocks();
    });

    test('isPhoneForced = true', () => {
        act(() => {
            Control.createControl(Main1, {}, container);
        });
        expect(document.body).toMatchSnapshot();
    });

    test('isPhoneForced = false', () => {
        act(() => {
            Control.createControl(Main2, {}, container);
        });
        expect(document.body).toMatchSnapshot();
    });

    test('without isPhoneForced', () => {
        act(() => {
            Control.createControl(Main3, {}, container);
        });
        expect(document.body).toMatchSnapshot();
    });
});
