import { Component, ReactNode } from 'react';
import { Record } from 'Types/entity';
import {
    observeVersionChange,
    unobserveVersionChange,
} from 'UICore/WasabyReactivity';

interface IClassComponentProps {
    onNewRecord: (recordSetter: (newRecord: Record) => void) => void;
}
interface IClassComponentState {
    record: Record;
}
export default class ClassComponent extends Component<
    IClassComponentProps,
    IClassComponentState
> {
    private renderCounter: number = 0;
    private setRecord(newRecord: Record): void {
        this.setState(({ record }) => {
            unobserveVersionChange(record, this.callUpdate);
            observeVersionChange(newRecord, this.callUpdate);
            return {
                record: newRecord,
            };
        });
    }
    private callUpdate(): void {
        this.setState({});
    }
    constructor(props: IClassComponentProps) {
        super(props);
        this.state = {
            record: undefined,
        };
        this.setRecord = this.setRecord.bind(this);
        this.callUpdate = this.callUpdate.bind(this);
    }
    render(): ReactNode {
        this.props.onNewRecord(this.setRecord);
        return (
            <div>
                <div>{++this.renderCounter}</div>
                <div>
                    {this.state.record
                        ? this.state.record.get('text')
                        : 'no record'}
                </div>
            </div>
        );
    }
    componentWillUnmount(): void {
        unobserveVersionChange(this.state.record, this.callUpdate);
    }
}
