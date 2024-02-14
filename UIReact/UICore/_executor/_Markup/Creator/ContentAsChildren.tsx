import { forwardRef, ComponentType, ForwardedRef } from 'react';
interface IContentProps {
    forwardedRef: ForwardedRef<unknown>;
}
interface IContentAsChildrenProps {
    content: ComponentType<IContentProps>;
}

export default forwardRef<unknown, IContentAsChildrenProps>(
    function ContentAsChildren({ content: Content, children, ...rest }, ref) {
        return <Content forwardedRef={ref} {...rest} />;
    }
);
