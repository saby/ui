/**
 * @jest-environment jsdom
 */
import If from './_condition/If';
import { assert } from 'chai';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

const NODES_TEXT = ['I', 'Am', 'Fine'];
const NODE_TYPE = 'div';

describe('Check result of "if condition"', () => {
    let container = null;

    beforeEach(() => {
        // setup a DOM element as a render target
        container = document.createElement('div', {});
        document.body.appendChild(container);
    });

    afterEach(() => {
        // cleanup on exiting
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('should return three nodes when value true', () => {
        act(() => {
            render(<If value={true} />, container);
        });
        const children = [...container.children[0].children];
        children.forEach((element, key) => {
            assert.equal(element.tagName.toLowerCase(), NODE_TYPE);
            assert.equal(element.textContent, NODES_TEXT[key]);
        });
    });

    it('should return one node when value false', () => {
        act(() => {
            render(<If value={false} />, container);
        });
        const child = container.children[0];
        assert.equal(child.textContent, NODES_TEXT[1]);
        assert.equal(child.tagName.toLowerCase(), NODE_TYPE);
    });
});
