import {
    FC,
    useEffect,
    memo,
    PropsWithChildren
} from 'react';

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
