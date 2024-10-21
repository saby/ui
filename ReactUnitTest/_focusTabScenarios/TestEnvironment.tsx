import { PropsWithChildren } from 'react';
import { FocusRoot, FocusEnvironment } from 'UI/Focus';

type TTestEnvironmentProps = PropsWithChildren<{}>;
export default function TestEnvironment({ children }: TTestEnvironmentProps): JSX.Element {
    return (
        <FocusEnvironment>
            <FocusRoot cycling={true} className="environment">
                <div className="testStart" tabIndex={0}>
                    Начинаем с клика сюда
                </div>
                {children}
            </FocusRoot>
        </FocusEnvironment>
    );
}
