import { FC, MutableRefObject } from 'react';
import WasabyContentInRoot from './WasabyContentInRoot';
import InnerWasaby from './InnerWasaby';

interface IRootReactComponentProps {
    wasabyForwardedRef: MutableRefObject<HTMLDivElement>;
    contentForwardedRef: MutableRefObject<HTMLDivElement>;
    wasabyContentType: 'HTMLElement' | 'WasabyControl';
    contentClassName: string;
}

const RootReactForwardingRefVar: FC<IRootReactComponentProps> = function RootReactForwardingRef({
    wasabyForwardedRef,
    contentForwardedRef,
    wasabyContentType,
    contentClassName,
}: IRootReactComponentProps) {
    let children: JSX.Element;
    if (wasabyContentType === 'HTMLElement') {
        children = (
            <div className={contentClassName} ref={contentForwardedRef}>
                Hello content
            </div>
        );
    }
    if (wasabyContentType === 'WasabyControl') {
        children = <InnerWasaby className={contentClassName} forwardedRef={contentForwardedRef} />;
    }

    return (
        <div className="rootReactForwardingRef">
            <WasabyContentInRoot forwardedRef={wasabyForwardedRef}>{children}</WasabyContentInRoot>
        </div>
    );
};

export default RootReactForwardingRefVar;