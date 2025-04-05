/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { NotifyWrapper } from 'UICore/Events';

interface IProps {
    onDidMount: (val: string) => void;
    changeVal: () => void;
}

export default class ReactControlClass extends React.Component<IProps> {
    constructor(props) {
        super(props);

        this._afterMount = this._afterMount.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    _afterMount() {
        this.props.onDidMount('React MyComponent Class');
    }

    handleClick() {
       this.props.changeVal();
    }

    render() {
       return (
        <NotifyWrapper callAfterMount={[this._afterMount]}>
            <div onClick={this.handleClick}>React MyComponent Class</div>
        </NotifyWrapper>
       );
    }
}

