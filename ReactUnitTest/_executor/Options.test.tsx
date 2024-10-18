/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';

import { createSandbox } from 'sinon';
import { act } from 'react-dom/test-utils';

import { Control } from 'UICore/Base';

import WithReadOnly from './resources/InheritOptions/WithReadOnly';
import WithoutReadOnly from './resources/InheritOptions/WithoutReadOnly';

const creator = Control.createControl;

describe('Markup inherit options', () => {
    let container;
    let sandbox;
    let clock;

    beforeEach(() => {
        sandbox = createSandbox();
        clock = sandbox.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
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

    it('readOnly указан и наследуется в inline шаблоне вставленном через if', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WithReadOnly, {}, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });

    it('readOnly не указан и наследуется в inline шаблоне вставленном через if', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WithoutReadOnly, {}, container);
        });
        tick(0);
        // endregion

        expect(container).toMatchSnapshot();
    });
});
