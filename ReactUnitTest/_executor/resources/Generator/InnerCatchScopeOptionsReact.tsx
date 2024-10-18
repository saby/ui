import { Component, ReactNode, ForwardedRef } from 'react';

interface IProps {
    $wasabyRef?: ForwardedRef<HTMLDivElement>;
    forwardedRef?: ForwardedRef<HTMLDivElement>;
    _$createdFromCode?: boolean;
    anotherOption?: string;
}

export default class InnerCatchScopeOptionsReact extends Component<IProps> {
    render(): ReactNode {
        return (
            <div
                id="innerCatchScopeOptionsReact"
                ref={this.props.$wasabyRef || this.props.forwardedRef}
            >
                <h1>внутренний реакт компонент</h1>
                <div>{'значение опции _$createdFromCode: ' + this.props._$createdFromCode}</div>
                <div>{'значение опции anotherOption: ' + this.props.anotherOption}</div>
            </div>
        );
    }
}
