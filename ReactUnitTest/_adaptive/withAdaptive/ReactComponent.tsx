import { Component, ComponentClass } from 'react';
import { withAdaptiveMode, AdaptiveModeType } from 'UICore/Adaptive';

interface IReactComponentProps {
    adaptiveMode: AdaptiveModeType;
}

class ReactComponent extends Component<IReactComponentProps> {
    render(): JSX.Element {
        return (
            <div className="reactWithAdaptiveMode">
                <div>{'' + this.props.adaptiveMode.container.clientWidth.value}</div>
            </div>
        );
    }
}

export default withAdaptiveMode(ReactComponent as ComponentClass);
