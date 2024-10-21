import { FocusRoot } from 'UI/Focus';

export default function Root3(): JSX.Element {
    return (
        <div>
            <p>FocusRoot tabIndex = 0:</p>
            <FocusRoot as="div" tabIndex={0}>
                <p>FocusRoot tabIndex = 0:</p>
                <FocusRoot as="div" tabIndex={0}>
                    <p>input</p>
                    <div>
                        <input className="input1" type="text" placeholder="no tabIndex" />
                    </div>
                    <p>FocusRoot cycling tabIndex = 0:</p>
                    <FocusRoot cycling={true} tabIndex={0}>
                        <input
                            className="input2"
                            type="text"
                            tabIndex={0}
                            placeholder="tabIndex = 0"
                        />
                        <br />
                        <input
                            className="input3"
                            type="text"
                            tabIndex={0}
                            placeholder="tabIndex = 0"
                        />
                        <br />
                        <input
                            className="input4"
                            type="text"
                            tabIndex={0}
                            placeholder="tabIndex = 0"
                        />
                    </FocusRoot>
                    <p>FocusRoot cycling tabIndex = 0:</p>
                    <FocusRoot cycling={true} tabIndex={0}>
                        <input
                            className="input5"
                            type="text"
                            tabIndex={-1}
                            data-qa="Клик перед второй фазой"
                            placeholder="tabIndex = -1"
                        />
                    </FocusRoot>
                </FocusRoot>
                <p>input</p>
                <div>
                    <input
                        className="input6"
                        type="text"
                        placeholder="no tabIndex"
                        data-qa="Клик перед третьей фазой"
                    />
                </div>
            </FocusRoot>
        </div>
    );
}
