/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ErrorBoundary from './resources/ErrorBoundaryTest/ErrorBoundary';

describe('ErrorBoundary', () => {
    let container;
    beforeEach(() => {
        // подготавливаем DOM-элемент, куда будем рендерить
        container = document.createElement('div');
        document.body.appendChild(container);
        // мокаем console.error т.к. React таким образом пишет ошибку в render контрола CrashedControl
        jest.spyOn(console, 'error').mockImplementation(() => {
            return null;
        });
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
});
