import { Component } from 'react';
import Main1 from './Main1';

interface IState {
    className: string;
}

export default class Main2 extends Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = { className: '' };
    }

    setClassName(className: string) {
        this.setState({ className });
    }
    render() {
        return (
            <div className={this.state.className}>
                <Main1 />
            </div>
        );
    }
}
