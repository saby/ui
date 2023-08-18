import * as React from 'react';
import { TInternalProps } from 'UICore/Executor';
import { createElement } from 'UICore/Jsx';
import { default as InnerControl } from './InnerControl';
import { default as PreventedInnerControl } from './PreventedInnerControl';

interface IProps extends TInternalProps {
    content: Function;
    value?: any;
}

function ReactTemplate(props: IProps): JSX.Element {
    return (
        <>
            вставка контента из wasaby:
            {createElement(
                props.content,
                {},
                undefined,
                undefined,
                props.context
            )}
            вставка InnerControl без value:
            <InnerControl />
            вставка PreventedInnerControl без value:
            <PreventedInnerControl />
            вставка InnerControl c value:
            <InnerControl value={props.value} />
            вставка PreventedInnerControl c value:
            <PreventedInnerControl value={props.value} />
        </>
    );
}
class ReactControl extends React.Component<IProps> {
    render(): JSX.Element {
        return <ReactTemplate {...this.props} />;
    }
}

export default ReactControl;
