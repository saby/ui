import { CSSProperties } from 'react';
import StyledWasaby from './StyledWasaby';
import { reactSize } from './constants';

const style: CSSProperties = {
    height: reactSize,
    right: reactSize,
    left: 0,
};

export default function ReactWithWasaby() {
    return (
        <div className="reactWithWasaby">
            <StyledWasaby style={style} />
        </div>
    );
}
