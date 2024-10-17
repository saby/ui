import * as React from 'react';
import { default as InnerControl } from './InnerControl';
import { default as PreventedInnerControl } from './PreventedInnerControl';

function ReactTemplate(props: any): JSX.Element {
    return (
        <>
            вставка InnerControl:
            <InnerControl {...props} />
            вставка PreventedInnerControl:
            <PreventedInnerControl {...props} />
        </>
    );
}
class ReactControl extends React.Component<any> {
    render(): JSX.Element {
        return <ReactTemplate {...this.props} />;
    }
}

export default ReactControl;
