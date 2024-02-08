import { PropsWithChildren } from 'react';

type TReactComponentWithClassNameProps = PropsWithChildren<{
    className: string;
}>;

export default function ReactComponentWithClassName({
    className,
    children,
}: TReactComponentWithClassNameProps): JSX.Element {
    return <div className={className}>{children}</div>;
}
