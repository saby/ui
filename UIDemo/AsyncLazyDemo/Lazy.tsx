import { forwardRef, Ref, useCallback, useMemo, useState } from 'react';
import { lazy, importer } from 'UI/Async';
import 'css!UIDemo/AsyncDemo/Index';

const AsyncStatic = lazy(() => importer('UIDemo/AsyncLazyDemo/_lazy/Static'));

const Lazy = forwardRef(function Lazy(_, ref: Ref<HTMLDivElement>) {
    const [changeComponent, setChangeComponent] = useState(false);

    const AsyncDynamic = useMemo(() => {
        let name: string;
        if (changeComponent) {
            name = 'UIDemo/AsyncLazyDemo/_lazy/DynamicTwo';
        } else {
            name = 'UIDemo/AsyncLazyDemo/_lazy/DynamicOne';
        }
        return lazy(() => importer(name));
    }, [changeComponent]);
    const dynamicProp = useMemo(() => {
        return changeComponent ? 'dynamic lazy, two' : 'dynamic lazy, one';
    }, [changeComponent]);

    const onClick = useCallback(() => {
        setChangeComponent(!changeComponent);
    }, [changeComponent]);

    return (
        <div className="UIDemo-AsyncDemo" ref={ref}>
            <h3 className="UIDemo-AsyncDemo__headerMain">Демо UI/Async:lazy</h3>

            <div className="UIDemo-AsyncDemo__column demo-AsyncDemo__internalOptColumn">
                <span className="UIDemo-AsyncDemo__subHeader">
                    1. "Статичная" загрузка компонента
                </span>
                <div className="UIDemo-AsyncDemo__row">
                    В компонент передается текст 'static lazy'
                </div>
                <AsyncStatic someProp={'static lazy'} />
            </div>

            <div className="UIDemo-AsyncDemo__column demo-AsyncDemo__internalOptColumn">
                <span className="UIDemo-AsyncDemo__subHeader">
                    2. "Динамичная" загрузка компонента{' '}
                </span>
                <div className="UIDemo-AsyncDemo__row">
                    В компонент передается текст 'dynamic lazy, one' или 'dynamic lazy, two'
                </div>
                <div className="UIDemo-AsyncDemo__row">
                    <button onClick={onClick}>Изменить компонент</button>
                </div>
                <AsyncDynamic someProp={dynamicProp} />
            </div>
        </div>
    );
});

Lazy.displayName = 'UIDemo/AsyncLazyDemo/Lazy';
export default Lazy;
