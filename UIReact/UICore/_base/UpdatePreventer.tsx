import * as React from 'react';
import { TInternalProps } from 'UICore/Executor';
import { Options } from 'UICommon/Vdom';
import { delimitProps } from 'UICore/Jsx';

interface IProps extends TInternalProps {
    children?: any;
    forwardedRef?: React.ForwardedRef<any>;
}

export function UpdatePreventer(
    Component: React.ComponentType
): React.ComponentType {
    class ReactControl extends React.Component<IProps> {
        oldVersions: object;

        shouldComponentUpdate(nextProps: IProps): boolean {
            const newPropsDelimited = delimitProps(nextProps);
            const oldPropsDelimited = delimitProps(this.props);

            const changedOptions = Options.getChangedOptions(
                newPropsDelimited.clearProps,
                oldPropsDelimited.clearProps,
                false,
                this.oldVersions || {},
                true,
                undefined,
                undefined,
                undefined,
                true
            );

            const changedAttributes = Options.getChangedOptions(
                newPropsDelimited.userAttrs,
                oldPropsDelimited.userAttrs,
                false,
                {},
                true,
                undefined,
                undefined,
                undefined,
                true
            );

            return !!changedOptions || !!changedAttributes;
        }

        render(): JSX.Element {
            this.oldVersions = Options.collectObjectVersions(this.props);

            const { forwardedRef, ...rest } = this.props;
            return <Component ref={forwardedRef} {...rest} />;
        }
    }

    return React.forwardRef((props: IProps, ref: React.ForwardedRef<any>) => {
        return <ReactControl {...props} forwardedRef={ref} />;
    });
}
