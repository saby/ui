/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';

import { act } from 'react-dom/test-utils';

import { Control } from 'UICore/Base';
import { GeneratorVdom } from 'UICore/Executor';
import Parent from './resources/Generator/Parent';
import Empty from './resources/Generator/Empty';
import AttrKeyRoot from './resources/Generator/AttrKeyRoot';
import EmptyControl from './resources/EmptyRoot/EmptyControl';
import EmptyTemplate from './resources/EmptyRoot/EmptyTemplate';

const creator = Control.createControl;

describe('Генератор', () => {
    let container;
    let consoleMock;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.restoreAllMocks();
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
        consoleMock = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        consoleMock.mockRestore();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('Пустая шаблонная функция должна строится без ошибок', () => {
        act(() => {
            creator(Parent, {}, container);
        });

        act(async () => {
            jest.advanceTimersByTime(0);
        });
        act(async () => {
            jest.advanceTimersByTime(0);
        });
        expect(consoleMock).not.toHaveBeenCalled();
    });

    it('В массив элементов не попадает undefined (инлайн шаблоны с ws:if)', () => {
        const generatorMock = jest.spyOn(
            GeneratorVdom.prototype,
            'joinElements'
        );
        act(() => {
            creator(Empty, {}, container);
        });
        // joinElements будет вызван 2 раза:
        // 1 - для ws:template
        // 2 - для самого шаблона контрола
        // нас интересует второй вызов, т.к. инлайн шаблон вернет массив с undefined
        // проверяем что undefined были удалены из конечного массива
        expect(generatorMock.mock.results[1].value).toEqual([]);
    });

    it('Атрибут "attr:key" сохраняется на корневой ноде', () => {
        act(() => {
            creator(AttrKeyRoot, {}, container);
        });
        const div = document.getElementById('myKey');
        expect(div.getAttribute('key')).toEqual('myKey');
    });

    it('Отсутствие корневого элемента шаблона контрола приводит к ошибке', () => {
        act(() => {
            creator(EmptyControl, {}, container);
        });

        act(async () => {
            jest.advanceTimersByTime(0);
        });
        act(async () => {
            jest.advanceTimersByTime(0);
        });
        expect(consoleMock).toHaveBeenCalledTimes(1);
        expect(consoleMock.mock.calls[0][1]).toContain(
            'Шаблон не построил верстку, шаблон должен построить хотя бы что-нибудь'
        );
    });

    it('Отсутствие контентной опции шаблона приводит к ошибке', () => {
        act(() => {
            creator(EmptyTemplate, {}, container);
        });

        act(async () => {
            jest.advanceTimersByTime(0);
        });
        act(async () => {
            jest.advanceTimersByTime(0);
        });
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(consoleMock.mock.calls[0][1]).toContain(
            'Шаблон не построил верстку, шаблон должен построить хотя бы что-нибудь'
        );
    });
});
