/**
 * @jest-environment jsdom
 */
import { assert } from 'chai';
import { createSandbox } from 'sinon';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { default as Parent } from 'ReactUnitTest/_stateReceiver/Controls/Parent';

describe('UICore/Base:Control ReceivedState', () => {
    let clock;
    let sandbox;
    let container: HTMLDivElement;

    beforeEach(() => {
        sandbox = createSandbox();
        /*
      _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
      Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
       */
        clock = sandbox.useFakeTimers();

        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        clock.restore();
        sandbox.restore();

        container.remove();
    });

    it('Потомкам проставляется ключ для StateReceiver', () => {
        let instance;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });

        /** Искомый потомок второй по счету а поддереве. Поэтому 0 (корень) _ 1 (второй потомок) */
        assert.equal(instance.getChildrenKey(), 'undefined_el_0_1_');
    });
});
