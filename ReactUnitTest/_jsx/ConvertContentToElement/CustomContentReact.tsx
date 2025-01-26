import InnerReactWithContent from './InnerReactWithContent';
import ClassNamed from './ClassNamed';

export default function CustomContentReact(): JSX.Element {
    return (
        <div className="customContentReact">
            <InnerReactWithContent customContent={ClassNamed} />
        </div>
    );
}
