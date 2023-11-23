import { FC, ComponentType, ElementType } from 'react';

interface IRootReactComponentProps {
    WasabyComponentWithContent: ComponentType<unknown>;
    Content?: ElementType<{ className: string }>;
}

const RootReactComponentVar: FC<IRootReactComponentProps> = function RootReactComponent({
    WasabyComponentWithContent,
    Content = 'div',
}: IRootReactComponentProps) {
    return (
        <div className="rootReactComponent">
            <WasabyComponentWithContent>
                <Content className="content">Hello content</Content>
            </WasabyComponentWithContent>
        </div>
    );
};

export default RootReactComponentVar;
