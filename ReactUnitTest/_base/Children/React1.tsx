import { forwardRef, ForwardedRef, useState } from 'react';
interface IFnComponentProps {
    value: string;
}

export default forwardRef(function FnComponent(
    props: IFnComponentProps,
    ref: ForwardedRef<HTMLDivElement>
) {
    const [rootTag, setRootTag] = useState<'div' | 'span'>('div');
    function changeRootTag() {
        setRootTag('span');
    }
    const RootTag = rootTag;
    return (
        <RootTag id="reactFnComponentRoot" ref={ref} onClick={changeRootTag}>
            {props.value}
        </RootTag>
    );
});
