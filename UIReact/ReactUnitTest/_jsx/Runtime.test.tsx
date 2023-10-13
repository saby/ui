/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode, render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Root from './Runtime/Root';
const RootTemplate = requirejs('wml!ReactUnitTest/_jsx/Runtime/RootTemplate');

describe('Подмена React.createElement для совместимости с васаби', () => {
    let container: HTMLDivElement;

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

    it('Вставка wasaby-контрола с генерацией React.createElement', () => {
        act(() => {
            const obj = {};
            render(<div><Root {...obj} key={123} value={123} className={'hello'}/></div>, container);
        });

        expect(container).toMatchSnapshot();
    });
    it('Вставка wasaby-шаблона с генерацией React.createElement', () => {
        act(() => {
            const obj = {};
            render(<div><RootTemplate {...obj} key={123} value={123} className={'hello'}/></div>, container);
        });

        expect(container).toMatchSnapshot();
    });


});
