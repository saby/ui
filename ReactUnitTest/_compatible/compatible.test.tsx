/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom';

import { Control } from 'UICore/Base';
import * as LayerCompatible from 'Lib/Control/LayerCompatible/LayerCompatible';
import WasabyRoot from './resources/WasabyRoot';

const creator = Control.createControl;

describe('Compatible WS3/Wasaby', () => {
    let container: HTMLDivElement;
    let consoleError: jest.SpyInstance;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.restoreAllMocks();
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setTimeout);
        consoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('Прямая вставка wasaby в ws3 приводит к ошибке', async () => {
        jest.spyOn(LayerCompatible, 'load').mockImplementation(() => ({
            addCallback: (cb) => {
                cb();
            },
        }));
        // отрисовываем компонент и сразу дожидаемся _afterMount
        act(() => {
            creator(WasabyRoot, {}, container);
        });

        await screen.findByTestId('ws3Control');
        expect(consoleError).toHaveBeenCalled();
        expect(consoleError.mock.calls[0][1]).toContain(
            'В ws3-окружении неправильно создается wasaby-контрол.'
        );
    });
});
