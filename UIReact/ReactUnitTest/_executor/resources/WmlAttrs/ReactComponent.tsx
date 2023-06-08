import { Component, ReactElement } from 'react';

interface IProps {
    attrs?: {
        'data-qa'?: string;
    };
}

export default class ReactComponent extends Component<IProps> {
    render(): ReactElement {
        return <div data-qa={this.props.attrs['data-qa']}>react component</div>;
    }
}
