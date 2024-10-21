import { useCallback, useState } from 'react';
import { Async } from 'UI/Async';

export default function ComponentProps() {
    const [componentProps, setComponentProps] = useState({ prop: true });

    const changeComponentProps = useCallback(() => {
        setComponentProps({ prop: !componentProps.prop });
    }, [componentProps]);

    return (
        <div>
            <div className="UIDemo-AsyncDemo__buttonContainer">
                <input
                    type="button"
                    value="Изменить опции компонента"
                    onClick={changeComponentProps}
                    className="UIDemo-AsyncDemo__navigationButton demo-AsyncDemo__templateOpt"
                />
            </div>
            <Async
                componentName="UIDemo/AsyncLazyDemo/_index/ComponentPropsInner"
                className="UIDemo-AsyncDemo__container demo-AsyncDemo__internalOptContainer"
                componentProps={componentProps}
            />
        </div>
    );
}
