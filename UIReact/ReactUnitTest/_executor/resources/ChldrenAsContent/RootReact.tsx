import { FC, ComponentType } from 'react';
import type { TemplateFunction } from 'UICommon/Base';

interface IRootReactComponentProps {
    WasabyComponentWithContent: ComponentType<unknown> | TemplateFunction;
}

const RootReactComponentVar: FC<IRootReactComponentProps> =
    function RootReactComponent({
        WasabyComponentWithContent,
    }: IRootReactComponentProps) {
        return (
            <div className="rootReactComponent">
                <WasabyComponentWithContent>
                    <div className="content">Hello content</div>
                </WasabyComponentWithContent>
            </div>
        );
    };

export default RootReactComponentVar;
