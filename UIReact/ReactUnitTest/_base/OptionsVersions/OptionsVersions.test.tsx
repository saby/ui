/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Parent from './Parent';
import Child1 from './Child1';
import Child3 from './Child3';

describe('Сохранение версий версионируемых опций до _beforeMount', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.restoreAllMocks();
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    test('все контролы синхронные', async () => {
        let child1InitialOptionsVersions;
        jest.spyOn<any, string>(
            Child1.prototype,
            '_beforeMount'
        ).mockImplementation(function () {
            child1InitialOptionsVersions = this._optionsVersions;
        });
        const child3BeforeUpdateSpy = jest
            .spyOn<any, string>(Child3.prototype, '_beforeUpdate')
            .mockName('child3BeforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        await act(async () => {
            jest.runOnlyPendingTimers();
        });

        expect(child3BeforeUpdateSpy).toBeCalledTimes(0);
        expect(child1InitialOptionsVersions).toHaveProperty('record', 0);
        expect(parent.getChild1()._optionsVersions).toHaveProperty('record', 1);
    });
});
