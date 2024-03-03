/**
 * @jest-environment jsdom
 */
import { Control } from 'UI/Base';
import { act } from 'react-dom/test-utils';
import { default as Parent } from 'ReactUnitTest/_stateReceiver/Controls/Parent';

const creator = Control.createControl;

describe('UICore/Base:Control ReceivedState', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    it('Потомкам проставляется ключ для StateReceiver', () => {
        let instance: Parent;
        act(() => {
            creator(
                Parent,
                {
                    ref: (v) => {
                        instance = v;
                    },
                    rskey: 'test_',
                },
                container
            );
        });

        /** Искомый потомок второй по счету а поддереве. Поэтому 0 (корень) _ 1 (второй потомок) */
        expect(instance.getChildrenKey()).toBe('test_0_1_');
    });
});
