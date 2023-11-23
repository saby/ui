import { ReactElement, forwardRef, Ref, ReactNode } from 'react';

interface ISimpleChildrenInsertProps {
    className?: string;
    somePropFromScope?: string;
    children?: ReactNode;
}

export default forwardRef(function SimpltChildrenInsert(
    props: ISimpleChildrenInsertProps,
    ref: Ref<HTMLDivElement>
): ReactElement {
    const addClassName = props.className ? ` ${props.className}` : '';
    const scopeClassName = props.somePropFromScope ? ` ${props.somePropFromScope}` : '';
    return (
        <div className={`simple${addClassName}${scopeClassName}`} ref={ref}>
            {props.children || 'No children'}
        </div>
    );
});
