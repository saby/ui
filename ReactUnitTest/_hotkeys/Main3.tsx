import { Component } from 'react';
import Main1 from './Main1';

interface IState {
    name: string;
}

export default class Main2 extends Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = { name: '' };
    }

    setContainer(name: string) {
        this.setState({ name });
    }
    render() {
        return this.state.name === 'article' ? (
            <article>
                <Main1 />
            </article>
        ) : (
            <div>
                <Main1 />
            </div>
        );
    }
}
