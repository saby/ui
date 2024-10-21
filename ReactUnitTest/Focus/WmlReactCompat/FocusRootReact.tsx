import { FocusRoot } from 'UICore/Focus';

export default function FocusRootReact(): JSX.Element {
    return (
        <div className="notFocusRoot">
            <FocusRoot as="div" className="focusRootInReact" />
        </div>
    );
}
