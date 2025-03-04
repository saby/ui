import { Component, ReactElement } from 'react';

interface IProps {
    className?: string;
    'data-qa'?: string;
}

export default class ReactComponent extends Component<IProps> {
    render(): ReactElement {
        return (
            // prettier-ignore
            <div className={this.props.className} data-qa={this.props['data-qa']}>
                react component
            </div>
        );
    }
}
