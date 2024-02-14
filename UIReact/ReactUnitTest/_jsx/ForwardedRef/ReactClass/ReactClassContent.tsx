import { Component, Ref } from 'react';

interface IProps {
    content: any;
    forwardedRef: Ref<HTMLDivElement>;
}

export default class ReactClass extends Component<IProps> {
    render() {
        return <this.props.content forwardedRef={this.props.forwardedRef} />;
    }
}
