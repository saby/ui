import { Component } from 'react';
import { VersionStateDecorator } from 'UICore/_base/Control/VersionStateDecorator';

interface IDecoratedComponentProps {
    text: string;
}
export default class DecoratedComponent extends Component<IDecoratedComponentProps> {
    private versionStateDecorator: VersionStateDecorator = new VersionStateDecorator();
    private counter: number = 0;
    constructor(props: IDecoratedComponentProps) {
        super(props);
        this.upCounter = this.upCounter.bind(this);
        this.applyCounter = this.applyCounter.bind(this);
        this.state = {};
    }
    private upCounter(): void {
        this.counter++;
        this.versionStateDecorator.addChangedFieldName('counter');
    }
    private applyCounter(): void {
        this.setState(this.versionStateDecorator.setStateUpdater);
    }
    render(): JSX.Element {
        this.versionStateDecorator.clearChangedFieldNames();
        return (
            <div>
                <div>text from props: {this.props.text}</div>
                <div>current counter value: {'' + this.counter}</div>
                <div>
                    <button onClick={this.upCounter}>upCounter</button>
                </div>
                <div>
                    <button onClick={this.applyCounter}>applyCounter</button>
                </div>
                <div>{JSON.stringify(this.state, undefined, '  ')}</div>
            </div>
        );
    }
    shouldComponentUpdate(
        nextProps: Readonly<IDecoratedComponentProps>,
        nextState: Readonly<{}>
    ): boolean {
        return (
            nextProps.text !== this.props.text ||
            this.versionStateDecorator.hasChangesState(nextState, this.state)
        );
    }
}
