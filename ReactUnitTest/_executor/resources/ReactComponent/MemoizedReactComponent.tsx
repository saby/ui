import { Component, ReactNode, memo } from 'react';

interface IMemoizedReactComponentProps {
    forwardedRef: (element: HTMLDivElement) => void;
}

class MemoizedReactComponent extends Component<IMemoizedReactComponentProps> {
    render(): ReactNode {
        return <div ref={this.props.forwardedRef}></div>;
    }
}

export default memo(MemoizedReactComponent);
