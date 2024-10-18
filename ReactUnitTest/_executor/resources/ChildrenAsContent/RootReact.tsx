import { FC, ComponentType, ElementType } from 'react';

interface IRootReactComponentProps {
    WasabyComponentWithContent: ComponentType;
    Content?: ElementType<{ className?: string }>;
    contentClassName?: string;
}

const RootReactComponentVar: FC<IRootReactComponentProps> = function RootReactComponent({
    WasabyComponentWithContent,
    Content = 'div',
    contentClassName = 'content',
}: IRootReactComponentProps) {
    return (
        <div className="rootReactComponent">
            <WasabyComponentWithContent>
                <Content className={contentClassName}>Hello content</Content>
            </WasabyComponentWithContent>
        </div>
    );
};

export default RootReactComponentVar;
