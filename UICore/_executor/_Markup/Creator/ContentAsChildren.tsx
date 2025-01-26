/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { forwardRef, ComponentType, ForwardedRef } from 'react';
interface IContentProps {
    forwardedRef: ForwardedRef<unknown>;
}
interface IContentAsChildrenProps {
    content: ComponentType<IContentProps>;
}

export default forwardRef<unknown, IContentAsChildrenProps>(function ContentAsChildren(
    { content: Content, children, ...rest },
    ref
) {
    return <Content forwardedRef={ref} {...rest} />;
});
