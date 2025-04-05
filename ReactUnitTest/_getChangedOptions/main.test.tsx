/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox, SinonSandbox, SinonFakeTimers } from 'sinon';
import { delay } from 'Types/function';
import { Control } from 'UICore/Base';
import { default as WasabyControl } from './WasabyControl';
import { default as WasabyControl2 } from './WasabyControl2';

const creator = Control.createControl;
const destroyer = Control.destroyControl;

describe('тесты UpdatePreventer', () => {
    let container: HTMLDivElement;
    let sandbox: SinonSandbox;
    let clock: SinonFakeTimers;
    let consoleMock;

    beforeEach(() => {
        sandbox = createSandbox();
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
        */
        clock = sandbox.useFakeTimers();
        consoleMock = jest.spyOn(console, 'error').mockImplementation();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        clock.restore();
        sandbox.restore();
        consoleMock.mockRestore();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    /**
     * Эта функция существует для того, чтобы не забывать оборачивать тики в act.
     * Это нужно, чтобы реакт реагировал на изменение времени и обновлял компоненты.
     * @param duration Значение, на которое должно продвинуться время.
     */
    function tick(duration: number): void {
        act(() => {
            clock.tick(duration);
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
                    clock.tick(1);
                }
            });
        });
    }

    it('базовая проверка на работоспособность с изменением пропов', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WasabyControl, { value: 0 }, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        instance.value++;
        await tickWasabyUpdate();
        instance.value++;
        await tickWasabyUpdate();
        instance.value++;
        await tickWasabyUpdate();
        expect(container).toMatchSnapshot();
        destroyer(instance, container);
    });
    it('проверка на работоспособность с версионированными контролами', async () => {
        // region Setup
        let instance;
        const versionedObject = {
            _version: 0,
            getVersion(): number {
                return this._version;
            },
            nextVersion(): void {
                this._version++;
            },
        };
        act(() => {
            instance = creator(
                WasabyControl,
                { value: versionedObject },
                container
            );
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        versionedObject.nextVersion();
        await tickWasabyUpdate();
        versionedObject.nextVersion();
        await tickWasabyUpdate();
        versionedObject.nextVersion();
        await tickWasabyUpdate();
        expect(container).toMatchSnapshot();
        destroyer(instance, container);
    });

    it('базовая проверка на работоспособность с изменением атрибутов', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WasabyControl2, { value: 'class1' }, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        instance.value = 'class2';
        await tickWasabyUpdate();
        instance.value = 'class3';
        await tickWasabyUpdate();
        instance.value = 'class4';
        await tickWasabyUpdate();
        expect(container).toMatchSnapshot();
        destroyer(instance, container);
    });
});
