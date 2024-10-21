import { Component, Ref } from 'react';

interface IProps {
    content: any;
    forwardedRef: Ref<HTMLDivElement>;
    hasContainer: boolean;
}

export default class ReactClass extends Component<IProps> {
    render() {
        const text =
            !!this.props.forwardedRef && this.props.hasContainer
                ? 'ok'
                : 'not ok';
        return <div ref={this.props.forwardedRef}>{text}</div>;
    }
}
