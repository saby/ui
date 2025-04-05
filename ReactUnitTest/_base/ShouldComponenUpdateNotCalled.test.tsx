/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ControlParent from './resources/ShouldComponenUpdateNotCalled/ControlParent';
import ControlChild from './resources/ShouldComponenUpdateNotCalled/ControlChild';

describe('Вызов _beforeUpdate даже если не вызвался shouldComponentUpdate', () => {
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

    it('изменили реактивное свойство родителя, ребенок перестроился', async () => {
        // тут проверяется сценарий, когда родитель и ребенок один раз построились. потом у ребенка что-то поменяли
        // и он перестроился. После этого у родителя меняется реактивное свойство, которое прокинуто в ребенка,
        // но реакт решил не вызывать shouldComponentUpdate, но позовет render для этого контрола.
        // Но необходимо, чтобы _beforeUpdate этого контрола вызвался - последний снепшот упадет, если это не произойдет

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

        expect(container).toMatchSnapshot('1. Построили с исходными данными');

        // Делаем так, чтобы первое обновление ребенка прошло как обычно
        await act(async () => {
            parent.changeTestOption('some value');
        });

        // пропустить все таймеры, чтобы произошел полный цикл обновления
        await act(async () => {
            jest.runAllTimers();
        });

        // Мокаем shouldComponentUpdate ребенка после первого вызова, чтобы там не позвался его _beforeUpdate.
        // Ожидаем, что _beforeMount позовется в render и ребенок перестроится
        jest.spyOn(
            ControlChild.prototype,
            'shouldComponentUpdate'
        ).mockImplementation(() => {
            return true;
        });
        await act(async () => {
            parent.changeTestOption('value');
        });

        // пропустить все таймеры, чтобы произошел полный цикл обновления
        await act(async () => {
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot(
            '2. Всё перестроилось с новым состоянием'
        );
    });
});
