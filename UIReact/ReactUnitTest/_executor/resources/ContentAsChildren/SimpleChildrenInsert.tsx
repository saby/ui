import { ReactElement, forwardRef, Ref, ReactNode } from 'react';

interface ISimpleChildrenInsertProps {
    className?: string;
    children?: ReactNode;
}

export default forwardRef(function SimpltChildrenInsert(
    props: ISimpleChildrenInsertProps,
    ref: Ref<HTMLDivElement>
): ReactElement {
    const addClassName = props.className ? ` ${props.className}` : '';
    return (
        <div className={`simple${addClassName}`} ref={ref}>
            {props.children || 'No children'}
        </div>
    );
});
