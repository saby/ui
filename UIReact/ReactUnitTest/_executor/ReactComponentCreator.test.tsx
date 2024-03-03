import { renderToString } from 'react-dom/server';
import { act } from 'react-dom/test-utils';
import { ReactComponentCreator } from 'UICore/Executor';
import { TranslatableString } from './resources/ReactComponentCreator/rk';
import ReactFn from './resources/ReactComponentCreator/ReactFn';
import ReactFnProp from './resources/ReactComponentCreator/ReactFnProp';
import Wasaby from './resources/ReactComponentCreator/Wasaby';

// тесты того, что локализованный текст (типа TranslatableString) на СП
// перед отдачей в react конвертируется в "чистый" текст
describe('ReactComponentCreator', () => {
    test('convertStringChildren', () => {
        const props = {
            children: new TranslatableString('Строка'),
        };
        const newProps = ReactComponentCreator.convertStringChildren(props);

        expect(newProps.children).toStrictEqual('Строка');
    });

    test('react + rk children', () => {
        let html;
        act(() => {
            html = renderToString(<ReactFn />);
        });

        expect(html).toMatchSnapshot();
    });

    test('react + rk children prop', () => {
        let html;
        act(() => {
            html = renderToString(<ReactFnProp />);
        });

        expect(html).toMatchSnapshot();
    });

    test('wasaby -> react + rk', () => {
        let html;
        act(() => {
            html = renderToString(<Wasaby />);
        });

        expect(html).toMatchSnapshot();
    });
});
