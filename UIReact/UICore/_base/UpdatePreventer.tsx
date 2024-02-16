import * as React from 'react';
import { TInternalProps } from 'UICore/Executor';
import { delimitProps } from 'UICore/Jsx';

import type { TControlOptionsExtended, TVersionsCollection } from 'UICommon/Vdom';
import { getChangedOptions, collectObjectVersions } from 'UICommon/Vdom';

interface IProps extends TInternalProps {
    children?: any;
    forwardedRef?: React.ForwardedRef<any>;
}

export function UpdatePreventer(
    Component: React.ComponentType
): React.ComponentType {
    class ReactControl extends React.Component<IProps> {
        oldVersions: TVersionsCollection;

        shouldComponentUpdate(nextProps: IProps): boolean {
            const newPropsDelimited = delimitProps(nextProps);
            const oldPropsDelimited = delimitProps(this.props);

            const changedOptions = getChangedOptions(
                // @ts-ignore TS2345: Argument of type 'TOptions' is not assignable to parameter of type 'IOptions'.
                newPropsDelimited.clearProps as unknown as TControlOptionsExtended,
                oldPropsDelimited.clearProps as unknown as TControlOptionsExtended,
                this.oldVersions,
                undefined,
                false,
                false,
                true
            );

            const changedAttributes = getChangedOptions(
                newPropsDelimited.userAttrs,
                oldPropsDelimited.userAttrs,
                undefined,
                undefined,
                false,
                false,
                true
            );

            return !!changedOptions || !!changedAttributes;
        }

        render(): JSX.Element {
            this.oldVersions = collectObjectVersions(this.props);

            const { forwardedRef, ...rest } = this.props;
            return <Component ref={forwardedRef} {...rest} />;
        }
    }

    return React.forwardRef((props: IProps, ref: React.ForwardedRef<any>) => {
        return <ReactControl {...props} forwardedRef={ref} />;
    });
}
