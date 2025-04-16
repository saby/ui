/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { delay } from 'Types/function';
import { Control } from 'UICore/Base';

import WasabyUpdaterRoot from '../resources/WasabyUpdater/WasabyUpdaterRoot';

const creator = Control.createControl;
const destroyer = Control.destroyControl;

describe('WasabyUpdater', () => {
    describe('live scenarios', () => {
        const fakeControl = Control.prototype;

        it('basic', () => {
            expect(fakeControl).toBe(fakeControl);
        });
    });

    describe('browser', () => {
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

        /**
         * Эта функция существует для того, чтобы не забывать оборачивать тики в act.
         * Это нужно, чтобы реакт реагировал на изменение времени и обновлял компоненты.
         * @param duration Значение, на которое должно продвинуться время.
         */
        function tick(duration: number): void {
            act(() => {
                jest.advanceTimersByTime(duration);
            });
        }

        // В данный момент довольно сложная система вызова обновления, выделим его тик отдельно.
        async function tickWasabyUpdate(): Promise<void> {
            return act(async () => {
                await Promise.resolve();

                // За время requestAnimationFrame отвечает jsdom.
                // Можно было бы с запасом сделать clock.tick(100), но так точнее.
                await new Promise<void>((resolve) => {
                    let resolved: boolean = false;
                    // forceUpdate занимает 2 delay
                    delay(() => {
                        delay(() => {
                            resolved = true;
                            resolve();
                        });
                    });
                    while (!resolved) {
                        jest.advanceTimersByTime(1);
                    }
                });
            });
        }

        it('Очередь на обновление контролов очищается', async () => {
            // region Setup
            let instance;
            act(() => {
                instance = creator(WasabyUpdaterRoot, {}, container);
            });
            tick(0);
            // endregion
            await tickWasabyUpdate();
            const toggleAsync = document.getElementById('toggleAsync');
            const showSync = document.getElementById('showSync');
            act(() => {
                toggleAsync.dispatchEvent(
                    new window.MouseEvent('click', { bubbles: true })
                );
            });
            await tickWasabyUpdate();
            act(() => {
                showSync.dispatchEvent(
                    new window.MouseEvent('click', { bubbles: true })
                );
            });
            tick(2);
            await tickWasabyUpdate();
            expect(container).toMatchSnapshot();

            destroyer(instance, container);
        });
    });
});
