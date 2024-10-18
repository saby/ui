/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { getStore } from 'Application/Env';
import { Logger } from 'UICommon/Utils';
import Main from './Main';

import { Control } from 'UICore/Base';
const creator = Control.createControl;

describe('classOnRoot', () => {
    let container: HTMLDivElement;
    const headData = getStore<Record<string, boolean>>('HeadData');
    let isNewEnvironment;

    beforeAll(() => {
        isNewEnvironment = headData.get('isNewEnvironment');
        headData.set('isNewEnvironment', false);
    });

    afterAll(() => {
        headData.set('isNewEnvironment', isNewEnvironment);
    });

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        jest.spyOn(Logger, 'warn').mockImplementation();
    });

    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    // тут "проверяется" работа метода UICommon\_base\GeneratorConfig.prepareAttrsForRoot для WS3 контролов
    it('тема применяется и вешается на корневой элемент', async () => {
        let instance;

        act(() => {
            instance = creator(
                Main,
                {
                    theme: 'default__dark',
                },
                container
            );
        });

        expect(instance._container.classList.contains('abc')).toBe(true);
        expect(
            instance._container.classList.contains(
                'controls_theme-default__dark'
            )
        ).toBe(true);
        expect(instance._container.classList.length).toBe(2);
    });
});
