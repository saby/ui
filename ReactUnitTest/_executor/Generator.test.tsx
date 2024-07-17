/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';

import { act } from 'react-dom/test-utils';

import { Control } from 'UICore/Base';
import { GeneratorVdom } from 'UICore/Executor';
import Parent from './resources/Generator/Parent';
import Empty from './resources/Generator/Empty';
import EmptyControl from './resources/EmptyRoot/EmptyControl';
import EmptyTemplate from './resources/EmptyRoot/EmptyTemplate';
import RootUsingScopeOptions from './resources/Generator/RootUsingScopeOptions';

const creator = Control.createControl;

describe('Генератор', () => {
    let container: HTMLDivElement;
    let consoleMock: jest.SpyInstance;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.restoreAllMocks();
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setTimeout);
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
        const generatorMock = jest.spyOn(GeneratorVdom.prototype, 'joinElements');
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
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(consoleMock.mock.calls[0][1]).toContain(
            'Шаблон не построил верстку, шаблон должен построить хотя бы что-нибудь'
        );
        expect(consoleMock.mock.calls[1][1]).toContain('отсутствует _container');
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
        expect(consoleMock.mock.calls[1][1]).toContain('отсутствует _container');
    });

    it('Фильтр опций, которые не прокидываются через scope', () => {
        const forwardedRef = jest.fn();
        const $wasabyRef = jest.fn();
        act(() => {
            creator(
                RootUsingScopeOptions,
                {
                    forwardedRef,
                    $wasabyRef,
                    name: 'testName',
                    anotherOption: 'testOption',
                },
                container
            );
        });

        expect(container).toMatchSnapshot('Через скоуп прокидывается только anotherOption');

        expect(forwardedRef).not.toHaveBeenCalled();
        expect($wasabyRef).not.toHaveBeenCalled();
    });
});