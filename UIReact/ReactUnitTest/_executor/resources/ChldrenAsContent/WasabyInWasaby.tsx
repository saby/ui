import { FC } from 'react';
import OuterWasaby from './OuterWasaby';
import InnerWasaby from './InnerWasaby';

const WasabyInWasabyVar: FC = function WasabyInWasaby(): JSX.Element {
    return (
        <div>
            <OuterWasaby className="react-outer">
                <InnerWasaby className="react-inner" />
            </OuterWasaby>
        </div>
    );
};

export default WasabyInWasabyVar;
