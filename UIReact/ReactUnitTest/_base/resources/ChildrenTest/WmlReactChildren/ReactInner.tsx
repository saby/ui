import { Component, ReactElement, Ref } from 'react';

export default class ReactInner extends Component<{
    forwardedRef: Ref<HTMLDivElement>;
}> {
    render(): ReactElement {
        return <div ref={this.props.forwardedRef}>inner react</div>;
    }
}
