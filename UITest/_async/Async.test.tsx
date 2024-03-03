import { renderToString } from 'react-dom/server';
import { act } from 'react-dom/test-utils';
import { Logger } from 'UI/Utils';
import { Async } from 'UI/Async';

describe('UI/Async:Async на СП', () => {
    it('Синхронная загрузка контрола на сервере', () => {
        const moduleName = 'UITest/_async/TestControlSync';
        const loggerErrorSpy = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());

        let html;
        act(() => {
            html = renderToString(<Async componentName={moduleName} componentProps={{}} />);
        });

        expect(loggerErrorSpy).not.toBeCalled();
        expect(html).toMatchSnapshot();
    });

    it('Синхронная загрузка контрола на сервере, с ошибкой', () => {
        const moduleName = 'UITest/_async/Fail/TestControlSync';
        const loggerErrorSpy = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());

        let html;
        act(() => {
            html = renderToString(<Async componentName={moduleName} componentProps={{}} />);
        });

        expect(loggerErrorSpy).toBeCalledTimes(1);
        expect(loggerErrorSpy.mock.calls[0][0]).toMatchSnapshot('1. ошибка');
        expect(html).toMatchSnapshot('2. верстка');
    });
});
