import { useState } from 'react';
import { FocusArea, FocusRoot } from 'UICore/Focus';

function ComponentWithFocusRoot(): JSX.Element {
    const [className, setClassName] = useState('a');
    function onClickHandler() {
        setClassName((prevClassName) => prevClassName + 'a');
    }
    return (
        <div>
            <FocusRoot
                as="div"
                id="elementToClick"
                onClick={onClickHandler}
                className={className}
            />
        </div>
    );
}

export default function UpdateFocusRootTopComponent(): JSX.Element {
    return (
        <FocusArea tabIndex={1} autofocus={true}>
            <div>
                <ComponentWithFocusRoot />
            </div>
        </FocusArea>
    );
}
