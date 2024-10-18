/**
 * @jest-environment jsdom
 */
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Control } from 'UICore/Base';
import { IoC } from 'Env/Env';

describe('ControlHookError', () => {
    const originalLogger = IoC.resolve('ILogger');
    const myLogger = {
        console: '',
        error(_, message) {
            this.console = this.console + `\n${message}`;
        },
        warn: () => {},
        log: () => {},
        info: () => {},
    };

    async function waitMountAndUpdate() {
        await act(async () => {
            jest.runOnlyPendingTimers();
        });

        await act(async () => {
            jest.runOnlyPendingTimers();
        });
    }

    let container;

    beforeEach(() => {
        // переопределяем логгер, чтобы при ошибках загрузки не упали тесты из-за сообщений логгера
        IoC.bind('ILogger', myLogger);
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        jest.useFakeTimers();

        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        IoC.bind('ILogger', originalLogger);
        jest.useRealTimers();
    });

    it('ошибки хуков отловлены', async () => {
        const ERROR_BEFORE_MOUNT = 'ERROR_BEFORE_MOUNT';
        const ERROR_COMPONENT_DID_MOUNT = 'ERROR_COMPONENT_DID_MOUNT';
        const ERROR_SHOULD_UPDAATE = 'ERROR_SHOULD_UPDAATE';
        const ERROR_BEFORE_RENDER = 'ERROR_BEFORE_RENDER';
        const ERROR_BEFORE_UPDATE = 'ERROR_BEFORE_UPDATE';
        const ERROR_AFTER_UPDATE = 'ERROR_AFTER_UPDATE';
        const ERROR_AFTER_RENDER = 'ERROR_AFTER_RENDER';
        const ERROR_COMPONENT_DID_UPDATE = 'ERROR_COMPONENT_DID_UPDATE';
        const ERROR_BEFORE_UNMOUNT = 'ERROR_BEFORE_UNMOUNT';

        class ComponentWithErrors extends Control {
            _beforeMount() {
                throw new Error(ERROR_BEFORE_MOUNT);
            }
            _componentDidMount() {
                throw new Error(ERROR_COMPONENT_DID_MOUNT);
            }
            _shouldUpdate(): boolean {
                throw new Error(ERROR_SHOULD_UPDAATE);
            }
            _beforeRender() {
                throw new Error(ERROR_BEFORE_RENDER);
            }
            _beforeUpdate() {
                throw new Error(ERROR_BEFORE_UPDATE);
            }
            _afterUpdate() {
                throw new Error(ERROR_AFTER_UPDATE);
            }
            _afterRender() {
                throw new Error(ERROR_AFTER_RENDER);
            }
            _componentDidUpdate() {
                throw new Error(ERROR_COMPONENT_DID_UPDATE);
            }
            _beforeUnmount() {
                throw new Error(ERROR_BEFORE_UNMOUNT);
            }
        }

        let instance;
        act(() => {
            instance = render(<ComponentWithErrors />, container);
        });

        await waitMountAndUpdate();

        expect(myLogger.console.includes(ERROR_BEFORE_MOUNT)).toBeTruthy();
        expect(
            myLogger.console.includes(ERROR_COMPONENT_DID_MOUNT)
        ).toBeTruthy();
        /* expect(myLogger.console.includes(ERROR_BEFORE_RENDER)).toBeTruthy(); */
    });
});
