/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ControlParent from './resources/ShouldComponentUpdate/ControlParent';

async function waitMountAndUpdate() {
    await act(async () => {
        jest.advanceTimersByTime(ControlParent.timeToMountChild);
    });

    await act(async () => {
        jest.runOnlyPendingTimers();
    });

    await act(async () => {
        jest.runOnlyPendingTimers();
    });
}

describe('Вызов _beforeUpdate, если в процессе маунта поменялась реактивная опция', () => {
    let container;

    beforeEach(() => {
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        jest.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.restoreAllMocks();
    });

    it('Изменили реактивное свойство родителя, пока ребенок строился', async () => {
        let parent: ControlParent;
        act(() => {
            render(
                <ControlParent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await waitMountAndUpdate();

        expect(parent._children.child.checkState()).toBe(true);
    });
});
