import * as React from 'react';
import { TemplateFunction } from 'UICommon/Base';
import type { TWasabyContext } from 'UICore/Contexts';
import { getWasabyContext, WasabyContextManager } from 'UICore/Contexts';
import { AdaptiveModeClass, AdaptiveModeType } from './AdaptiveModeClass';
import 'css!UICore/_adaptive/adaptive';

interface IProps {
    content?: TemplateFunction;
    mode: string;
    adaptiveMode?: AdaptiveModeType;
    children?: React.ReactElement;
}

function isReactElement(node: React.ReactNode): node is React.ReactElement {
    return typeof node === 'object';
}

export default class ForcedAdaptiveModeHoc extends React.PureComponent<IProps> {
    prevProps: IProps;
    componentDidMount() {
        this.prevProps = this.props;
    }
    componentDidUpdate() {
        this.prevProps = this.props;
    }

    render() {
        const currAdaptiveMode: AdaptiveModeClass =
            this.props.adaptiveMode ??
            this.context.adaptiveMode ??
            new AdaptiveModeClass();
        if (
            currAdaptiveMode.isEqual([this.props.mode]) ||
            !isReactElement(this.props.children)
        ) {
            return this.props.children;
        }

        const adaptiveMode = new AdaptiveModeClass(
            currAdaptiveMode.getScreens(),
            this.props.mode
        );
        return (
            <WasabyContextManager
                adaptiveMode={adaptiveMode}
                isAdaptive={!adaptiveMode.up('lg')}
            >
                {React.cloneElement(this.props.children, {
                    className: 'forced-' + this.props.mode,
                    adaptiveMode,
                    isAdaptive: !adaptiveMode.up('lg'),
                })}
            </WasabyContextManager>
        );
    }
    static contextType: TWasabyContext = getWasabyContext();
}
