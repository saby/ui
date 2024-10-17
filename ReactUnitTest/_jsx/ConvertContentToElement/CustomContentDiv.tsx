import InnerReactWithContent from './InnerReactWithContent';

export default function CustomContentDiv(): JSX.Element {
    return (
        <div className="customContentDiv">
            <InnerReactWithContent customContent={<div className="divContent" />} />
        </div>
    );
}
