import * as WasabyWml from 'wml!ReactUnitTest/_jsx/ConvertContentToElement/SimpleWasaby';
import SimpleWasaby from './SimpleWasaby';
import InnerReactWithContent from './InnerReactWithContent';

export default function CustomContentWasabyAsElement(): JSX.Element {
    return (
        <div className="customContentWasabyAsElement">
            <InnerReactWithContent customContent={<WasabyWml className="wmlContent" />} />
            <InnerReactWithContent customContent={<SimpleWasaby className="controlContent" />} />
        </div>
    );
}
