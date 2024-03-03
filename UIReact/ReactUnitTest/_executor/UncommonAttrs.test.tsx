/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import WasabyWithStyledReact from './resources/UncommonAttrs/Style/WasabyWithReact';
import ReactWithStyledWasaby from './resources/UncommonAttrs/Style/ReactWithWasaby';
import WasabyWithLinkReact from './resources/UncommonAttrs/Target/WasabyWithLinkReact';
import ReactWithLinkWasaby from './resources/UncommonAttrs/Target/ReactWithLinkWasaby';

describe('Передача атрибутов, которых нет в списке wasabyToReactAttrNames, на стыке wasaby и react', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div', {});
        document.body.appendChild(container);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    describe('атрибут style', () => {
        test('Wasaby задаёт, react использует', () => {
            act(() => {
                render(<WasabyWithStyledReact />, container);
            });
            expect(container).toMatchSnapshot();
        });
        test('React задаёт, wasaby использует', () => {
            act(() => {
                render(<ReactWithStyledWasaby />, container);
            });
            expect(container).toMatchSnapshot();
        });
    });

    describe('атрибут target', () => {
        test('Wasaby задаёт, react использует', () => {
            act(() => {
                render(<WasabyWithLinkReact />, container);
            });
            expect(container).toMatchSnapshot();
        });
        test('React задаёт, wasaby использует', () => {
            act(() => {
                render(<ReactWithLinkWasaby />, container);
            });
            expect(container).toMatchSnapshot();
        });
    });
});
