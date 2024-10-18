import { CSSProperties } from 'react';
import { reactSize } from './constants';

interface IStyledReactProps {
    style: CSSProperties;
}

export default function StyledReact(props: IStyledReactProps) {
    const style: CSSProperties = {
        ...props.style,
        height: reactSize,
        right: reactSize,
    };
    return (
        <div className="styledReact" style={{ ...style }}>
            Styled React
        </div>
    );
}
