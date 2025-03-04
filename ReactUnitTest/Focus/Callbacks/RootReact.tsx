import { FC, memo, forwardRef } from 'react';
import { TInternalProps } from 'UICore/Executor';
import { FocusArea, FocusRoot } from 'UICore/Focus';
import Input from 'ReactUnitTest/Focus/Input';
import ReactInput from 'ReactUnitTest/Focus/ReactInput';

const WasabyInput = Input;

interface IRootReact extends TInternalProps {
    onRootActivated: () => void;
    onRootDeactivated: () => void;
    onWasabyActivated: () => void;
    onReactDeactivated: () => void;
}

const RootReact: FC<IRootReact> = forwardRef((props: IRootReact, ref?) => {
    return (
        <FocusRoot
            as="div"
            {...props.attrs}
            ref={ref}
            onActivated={props.onRootActivated}
            onDeactivated={props.onRootDeactivated}
        >
            <FocusRoot as="div" onDeactivated={props.onReactDeactivated}>
                <ReactInput inputId="focusCallbacksReactId" />
            </FocusRoot>
            <div>
                <FocusArea onActivated={props.onWasabyActivated}>
                    <WasabyInput inputId="focusCallbacksWasabyId" />
                </FocusArea>
            </div>
        </FocusRoot>
    );
});

export default memo(RootReact);
