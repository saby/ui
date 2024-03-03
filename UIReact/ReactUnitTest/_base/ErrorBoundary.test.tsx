/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ErrorBoundary from './resources/ErrorBoundaryTest/ErrorBoundary';
import {
    functionNameForTestStack,
    errorMessage,
} from './resources/ErrorBoundaryTest/CrashedControl';

describe('ErrorBoundary', () => {
    let container;
    let consoleMock: jest.SpyInstance;
    beforeEach(() => {
        // подготавливаем DOM-элемент, куда будем рендерить
        container = document.createElement('div');
        document.body.appendChild(container);
        // мокаем console.error т.к. React таким образом пишет ошибку в render контрола CrashedControl
        consoleMock = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });
    afterEach(() => {
        // подчищаем после завершения
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.restoreAllMocks();
    });
    it('ErrorBoundary должен отрисовать заглушку', () => {
        act(() => {
            render(<ErrorBoundary />, container);
        });
        expect(container).toMatchSnapshot();
    });
    it('Ошибка в консоль содержит оригинальный стек', () => {
        act(() => {
            render(<ErrorBoundary />, container);
        });
        const testingErrorCall = consoleMock.mock.calls.find(
            (call) => call[0].includes('CONTROL ERROR') && call[1].includes(errorMessage)
        );
        expect(testingErrorCall).toBeTruthy();
        expect(testingErrorCall[2]).toContain(functionNameForTestStack);
    });
});
