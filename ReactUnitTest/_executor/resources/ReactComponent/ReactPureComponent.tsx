import { PureComponent, ReactElement } from 'react';

export default class ReactPureComponent extends PureComponent {
    protected text: string = 'Is React Pure Component';
    render(): ReactElement {
        return <div>{this.text}</div>;
    }
}
