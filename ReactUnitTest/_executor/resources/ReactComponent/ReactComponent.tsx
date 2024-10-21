import { Component, ReactElement } from 'react';

export default class ReactComponent extends Component {
    protected text: string = 'Is React Component';
    render(): ReactElement {
        return <div>{this.text}</div>;
    }
}
