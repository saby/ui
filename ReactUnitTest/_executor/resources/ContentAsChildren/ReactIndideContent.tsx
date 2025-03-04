import { forwardRef, ForwardedRef } from 'react';

interface IReactIndideContentProps {
    children: string;
    className: string;
    'data-some-attr': string;
}

export default forwardRef(function ReactIndideContent(
    props: IReactIndideContentProps,
    ref: ForwardedRef<HTMLDivElement>
) {
    return (
        <div
            className={`ownClassName ${props.className || ''}`}
            data-some-attr={props['data-some-attr']}
            ref={ref}
        >
            React indide a content
        </div>
    );
});
