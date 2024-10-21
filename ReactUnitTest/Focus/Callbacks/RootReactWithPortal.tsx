import { useRef, useState, useCallback } from 'react';
import WasabyHOC from 'ReactUnitTest/Focus/HOC';
import { createPortal } from 'react-dom';
import { FocusRoot } from 'UICore/Focus';

export interface IRootReactWithPortalProps {
    onRootActivated: () => void;
    onRootDeactivated: () => void;

    onInputActivated: () => void;
    onInputDeactivated: () => void;
    inputId: string;

    onPortalActivated: () => void;
    onPortalDeactivated: () => void;
    portalInputId: string;
}

export default function RootReactWithPortal(props: IRootReactWithPortalProps): JSX.Element {
    const focusParentRef = useRef<HTMLDivElement>(null);
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
    const portalElementRef = useCallback((element: HTMLElement | null) => {
        setPortalElement(element);
    }, []);
    return (
        <div>
            <div ref={portalElementRef} />
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
                    {portalElement &&
                        createPortal(
                            <FocusRoot
                                onActivated={props.onPortalActivated}
                                onDeactivated={props.onPortalDeactivated}
                                focusParentRef={focusParentRef}
                            >
                                <WasabyHOC>
                                    <input type="text" id={props.portalInputId} />
                                </WasabyHOC>
                            </FocusRoot>,
                            portalElement
                        )}
                </div>
            </FocusRoot>
        </div>
    );
}
