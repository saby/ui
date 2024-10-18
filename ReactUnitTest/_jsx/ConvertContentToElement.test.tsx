/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode, render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Control } from 'UI/Base';
import CustomContentFromWml from './ConvertContentToElement/CustomContentFromWml';
import CustomContentDiv from './ConvertContentToElement/CustomContentDiv';
import CustomContentWasaby from './ConvertContentToElement/CustomContentWasaby';
import CustomContentWasabyAsElement from './ConvertContentToElement/CustomContentWasabyAsElement';
import CustomContentReact from './ConvertContentToElement/CustomContentReact';
import CustomContentReactAsElement from './ConvertContentToElement/CustomContentReactAsElement';

describe('ConvertContentToElement', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
    });

    describe('Задание контента в wml', () => {
        it('Контентная опция', () => {
            act(() => {
                Control.createControl(CustomContentFromWml, {}, container);
            });
            expect(container).toMatchSnapshot();
        });
    });

    describe('Задание контента в tsx', () => {
        it('Wasaby как компонент', () => {
            act(() => {
                render(<CustomContentWasaby />, container);
            });
            expect(container).toMatchSnapshot();
        });
        it('Wasaby как реакт элемент', () => {
            act(() => {
                render(<CustomContentWasabyAsElement />, container);
            });
            expect(container).toMatchSnapshot();
        });
        it('DOM элемент', () => {
            act(() => {
                render(<CustomContentDiv />, container);
            });
            expect(container).toMatchSnapshot();
        });
        it('Чистый реакт компонент', () => {
            act(() => {
                render(<CustomContentReact />, container);
            });
            expect(container).toMatchSnapshot();
        });
        it('Чистый реакт компонент как реакт элемент', () => {
            act(() => {
                render(<CustomContentReactAsElement />, container);
            });
            expect(container).toMatchSnapshot();
        });
    });
});
