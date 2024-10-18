import { FC } from 'react';
import OuterWasaby from './OuterWasaby';
import InnerWasaby from './InnerWasaby';

const WasabyInWasabyVar: FC = function WasabyInWasaby(): JSX.Element {
    return (
        <div>
            <OuterWasaby className="react-outer">
                <InnerWasaby
                    text="Text from WasabyInWasaby.tsx"
                    data-text="data-text from WasabyInWasaby.tsx"
                    className="react-inner"
                />
            </OuterWasaby>
        </div>
    );
};

export default WasabyInWasabyVar;
