import { Component, createRef, ReactNode, RefObject } from 'react';

export default class ReactOpener extends Component {
    private rootElementRef: RefObject<HTMLDivElement> = createRef();
    _moduleName: string = 'ReactOpener';
    get _container(): HTMLDivElement {
        return this.rootElementRef.current;
    }
    render(): ReactNode {
        return (
            <div ref={this.rootElementRef}>I am React Component opener.</div>
        );
    }
}
