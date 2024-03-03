/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { AdaptiveContainer } from 'UICore/Adaptive';

import AdaptiveAspectsValue from './CommonComponents/AdaptiveAspectsValue';

const strangeSizeToTest = 31415;

describe('withAdaptive HOC', () => {
    let container: HTMLDivElement;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });
    test('adaptiveMode through context', () => {
        act(() => {
            render(
                <AdaptiveContainer width={strangeSizeToTest}>
                    <AdaptiveContainer height={strangeSizeToTest}>
                        <AdaptiveContainer isPhone={true}>
                            <AdaptiveAspectsValue />
                        </AdaptiveContainer>
                    </AdaptiveContainer>
                </AdaptiveContainer>,
                container
            );
        });
        expect(container).toMatchSnapshot();
    });
});
