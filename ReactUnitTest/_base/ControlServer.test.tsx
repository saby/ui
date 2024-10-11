import { getStateReceiver } from 'Application/Env';
import OptionsToStateReceiver from './resources/ControlTest/OptionsToStateReceiver';
import { renderToString } from 'react-dom/server';
import { act } from 'react-dom/test-utils';

describe('UIReact/UICore/_base/Control node', () => {
    describe('Опции на сервере', () => {
        it('Передали опции в StateReceiver', () => {
            // region Setup
            let receivedState;
            act(() => {
                renderToString(<OptionsToStateReceiver />);
            });
            // endregion

            const stateReceiver = getStateReceiver();
            // @ts-ignore
            jest.spyOn(stateReceiver._logger, 'warn').mockImplementation();
            // @ts-ignore
            delete stateReceiver._serialized;
            stateReceiver.deserialize(stateReceiver.serialize().serialized);
            stateReceiver.register(OptionsToStateReceiver.defaultProps.rskey, {
                getState: () => {
                    return {};
                },
                setState: (value) => {
                    receivedState = value;
                },
            });

            expect(receivedState).toBeFalsy();
        });
    });
});
