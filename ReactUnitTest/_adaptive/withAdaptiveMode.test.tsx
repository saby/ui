/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { AdaptiveContainer, Storage } from 'UICore/Adaptive';

import ReactComponent from './withAdaptive/ReactComponent';
import Wasaby from './withAdaptive/Wasaby';

const strangeSizeToTest = 31415;

describe('withAdaptive HOC', () => {
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
    });

    test('Wasaby control', () => {
        act(() => {
            render(
                <AdaptiveContainer width={strangeSizeToTest}>
                    <Wasaby />
                </AdaptiveContainer>,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });
    test('Class react component', () => {
        act(() => {
            render(
                <AdaptiveContainer width={strangeSizeToTest}>
                    <ReactComponent />
                </AdaptiveContainer>,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });
});
