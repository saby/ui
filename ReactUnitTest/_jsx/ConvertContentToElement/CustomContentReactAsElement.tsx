import InnerReactWithContent from './InnerReactWithContent';
import ClassNamed from './ClassNamed';

export default function CustomContentReactAsElement(): JSX.Element {
    return (
        <div className="customContentReactAsElement">
            <InnerReactWithContent customContent={<ClassNamed className="reactComponent" />} />
        </div>
    );
}
