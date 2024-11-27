import { Component, ReactElement, Ref } from 'react';
import { delimitProps } from 'UICore/Jsx';

interface IOptions {
    forwardedRef: Ref<HTMLElement>;
    content: Function;
}

export default class ReactChild extends Component<IOptions> {
    render(): ReactElement {
        // тут особенность именно в том, что в content прокидываются все props, в которых есть name
        const { clearProps, userAttrs } = delimitProps(this.props);
        return (
            <this.props.content
                {...clearProps}
                attrs={userAttrs}
                forwardedRef={this.props.forwardedRef}
            />
        );
    }
}
