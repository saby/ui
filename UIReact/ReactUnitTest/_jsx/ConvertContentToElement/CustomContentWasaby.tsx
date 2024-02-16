import * as WasabyWml from 'wml!ReactUnitTest/_jsx/ConvertContentToElement/SimpleWasaby';
import SimpleWasaby from './SimpleWasaby';
import InnerReactWithContent from './InnerReactWithContent';

export default function CustomContentWasaby(): JSX.Element {
    return (
        <div className="customContentWasaby">
            <InnerReactWithContent customContent={WasabyWml} />
            <InnerReactWithContent customContent={SimpleWasaby} />
        </div>
    );
}
