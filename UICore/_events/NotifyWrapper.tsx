/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
import { FC, useEffect, memo, PropsWithChildren } from 'react';

interface IProps {
    callAfterMount: Function[];
}

/**
 * @class UICore/_events/NotifyWrapper
 * @public
 */
const NotifyWrapper: FC<PropsWithChildren<IProps>> = function (props) {
    useEffect(() => {
        for (const handler of props.callAfterMount) {
            handler();
        }
    }, []);
    return props.children as JSX.Element;
};

export default memo(NotifyWrapper);
