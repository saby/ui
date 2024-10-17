/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { TJsxProps } from 'UICore/Jsx';
import { Button } from 'Controls/buttons';

type TContentProps = {
    template: React.ComponentClass | string;
    templateOptions?: any;
};

function ContentWrapper(props) {
    return <div id="wrapper">{props.children}</div>;
}

const ClearPage = React.forwardRef(function ClearPage(
    props: TJsxProps<TContentProps>,
    ref: React.Ref<any>
): JSX.Element {
    if (typeof props.template === 'string') {
        // @ts-ignore
        return <Button forwardedRef={ref} caption={props.template} />;
    }
    const buttonProps = {
        forwardedRef: ref,
        caption: <props.template {...props.templateOptions} />,
    };
    return <Button {...buttonProps} />;
});

export default React.forwardRef((props, ref) => {
    return (
        <ContentWrapper>
            <ClearPage ref={ref} template={'Привет!'} />
        </ContentWrapper>
    );
});
