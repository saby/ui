import { TemplateFunction } from 'UI/Base';
import * as React from 'react';
import { DataContext } from './TestContext';
import { IControlOptions } from 'UI/Base';

interface IProps extends IControlOptions {
    innerComponent: TemplateFunction;
}

function TestContextConsumer(props: IProps): JSX.Element {
    const { selectedItems } = React.useContext(DataContext);

    return <props.innerComponent {...props} selectedItems={selectedItems} />;
}
export default React.memo(TestContextConsumer);
