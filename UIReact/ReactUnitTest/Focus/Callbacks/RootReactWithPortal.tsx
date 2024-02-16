import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { FocusRoot } from 'UICore/Focus';

interface IRootReactWithPortalProps {
    onRootActivated: () => void;
    onRootDeactivated: () => void;

    onInputActivated: () => void;
    onInputDeactivated: () => void;
    inputId: string;

    onPortalActivated: () => void;
    onPortalDeactivated: () => void;
    portalInputId: string;

    portalElement: HTMLElement;
}

export default function RootReactWithPortal(props: IRootReactWithPortalProps): JSX.Element {
    const focusParentRef = useRef<HTMLDivElement>();
    return (
        <FocusRoot
            as="div"
            onActivated={props.onRootActivated}
            onDeactivated={props.onRootDeactivated}
        >
            <FocusRoot
                autofocus={true}
                onActivated={props.onInputActivated}
                onDeactivated={props.onInputDeactivated}
            >
                <input type="text" id={props.inputId} />
            </FocusRoot>
            <div ref={focusParentRef}>
                {createPortal(
                    <FocusRoot
                        onActivated={props.onPortalActivated}
                        onDeactivated={props.onPortalDeactivated}
                        focusParentRef={focusParentRef}
                    >
                        <input type="text" id={props.portalInputId} />
                    </FocusRoot>,
                    props.portalElement
                )}
            </div>
        </FocusRoot>
    );
}
