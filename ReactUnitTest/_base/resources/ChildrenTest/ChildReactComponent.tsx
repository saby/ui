import { Component, ReactElement } from 'react';
import { delimitProps } from 'UICore/Jsx';

export default class ChildReactComponent extends Component {
    render(): ReactElement {
        const { $wasabyRef } = delimitProps(this.props);

        return <div ref={$wasabyRef}>I'm react component child.</div>;
    }
}
