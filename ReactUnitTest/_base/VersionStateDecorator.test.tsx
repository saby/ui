/**
 * @jest-environment jsdom
 */

import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/dom';
import Root from './VersionStateDecorator/VersionStateDecoratorRoot';

const user = userEvent.setup();

describe('VersionStateDecorator', () => {
    let container: HTMLElement;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    test('Обновление внутри компонента с декоратором', async () => {
        act(() => {
            render(<Root />, container);
        });
        expect(container).toMatchSnapshot('1. Инициализация');

        const upCounter = await screen.findByText('upCounter');
        await user.click(upCounter);
        expect(container).toMatchSnapshot(
            '2. После простого поднятия счётчика ничего не перерисовалось'
        );

        const applyCounter = await screen.findByText('applyCounter');
        await user.click(applyCounter);
        expect(container).toMatchSnapshot(
            '3. Счётчик применился, версия счётчика в стейте апнулась'
        );
    });

    test('Обновление в родителе компонента с декоратором', async () => {
        act(() => {
            render(<Root />, container);
        });

        const upCounter = await screen.findByText('upCounter');
        await user.click(upCounter);
        expect(container).toMatchSnapshot(
            '1. После простого поднятия счётчика ничего не перерисовалось'
        );

        const changeText = await screen.findByText('changeText');
        await user.click(changeText);
        expect(container).toMatchSnapshot(
            '2. Счётчик применился, потому что родитель поменял проп'
        );

        const applyCounter = await screen.findByText('applyCounter');
        await user.click(applyCounter);
        expect(container).toMatchSnapshot(
            '3. Версия счётчика в стейте не апнулась, потому что счётчик уже применился в прошлый рендер'
        );
    });
});
