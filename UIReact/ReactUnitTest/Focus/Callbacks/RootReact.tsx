import { FC, memo, forwardRef } from 'react';
import { createElement, wasabyAttrsToReactDom, delimitProps } from 'UICore/Jsx';
import { TInternalProps } from 'UICore/Executor';
import { useFocusCallbacks } from 'UICore/Focus';
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
    const { $wasabyRef, context, userAttrs } = delimitProps(props);
    const rootAttrs = wasabyAttrsToReactDom(userAttrs);

    const rootRef = useFocusCallbacks(
        {
            onActivated: props.onRootActivated,
            onDeactivated: props.onRootDeactivated,
        },
        $wasabyRef as (element: HTMLElement) => void
    );

    const wasabyActivatedRef = useFocusCallbacks({
        onActivated: props.onWasabyActivated,
    });

    const reactDeactivatedRef = useFocusCallbacks({
        onDeactivated: props.onReactDeactivated,
    });

    return (
        <div {...rootAttrs} ref={rootRef}>
            <div ref={reactDeactivatedRef}>
                <ReactInput inputId="focusCallbacksReactId" />
            </div>
            <div>
                {createElement(
                    WasabyInput,
                    {
                        inputId: 'focusCallbacksWasabyId',
                        $wasabyRef: wasabyActivatedRef,
                    } as TInternalProps,
                    undefined,
                    undefined,
                    context
                )}
            </div>
        </div>
    );
});

export default memo(RootReact);
