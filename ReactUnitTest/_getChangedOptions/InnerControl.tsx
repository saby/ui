import * as React from 'react';
import { TInternalProps } from 'UICore/Executor';

interface IProps extends TInternalProps {
    value?: any;
}

class InnerControl extends React.Component<IProps> {
    updateCount: number = 0;
    shouldComponentUpdate(): boolean {
        this.updateCount++;
        return true;
    }

    render(): JSX.Element {
        return (
            <div>
                updateCount=
                {this.updateCount}
            </div>
        );
    }
}

export default InnerControl;
