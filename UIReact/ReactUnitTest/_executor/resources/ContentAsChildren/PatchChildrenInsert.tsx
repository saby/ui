import {
    ReactElement,
    Children,
    cloneElement,
    forwardRef,
    Ref,
    ReactNode,
} from 'react';

interface IPatchChildrenInsertProps {
    className?: string;
    children?: ReactNode;
}

export default forwardRef(function PatchChildrenInsert(
    props: IPatchChildrenInsertProps,
    ref: Ref<HTMLDivElement>
): ReactElement {
    const addClassName = props.className ? ` ${props.className}` : '';
    return (
        <div className={`patch${addClassName}`} ref={ref}>
            {Children.map(props.children, (child: ReactElement) => {
                return cloneElement(child, {
                    className: 'patched',
                });
            }) || 'No children'}
        </div>
    );
});
