import { useEffect, useMemo, useState } from 'react';
import { Async } from 'UI/Async';

const componentName1: string = 'UIDemo/AsyncDemo/testModuleNoLib';
const componentName2: string = 'UIDemo/AsyncDemo/testLib:testModule';

export default function LoadModules() {
    const [isOK, setIsOK] = useState('false');

    useEffect(() => {
        let libModule: boolean = false;
        let noLibModule: boolean = false;
        const scripts = document.querySelectorAll('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.indexOf('testLib')) {
                libModule = true;
            }
            if (scripts[i].src.indexOf('testModuleNoLib')) {
                noLibModule = true;
            }
        }
        if (libModule && noLibModule) {
            setIsOK('true');
        }
    }, []);

    const componentProps = useMemo(() => {
        return { isOK };
    }, [isOK]);

    return (
        <div>
            <div className="UIDemo-AsyncDemo__column demo-AsyncDemo__loadModule">
                <span className="UIDemo-AsyncDemo__subHeader">
                    1. Асинхронная загрузка модуля (не библиотека)
                </span>
                <div className="UIDemo-AsyncDemo__row">
                    Асинхронно загружается модуль. После успешной загрузки меняется prop компонента
                    на значение "true".
                </div>
                <Async
                    componentName={componentName1}
                    componentProps={componentProps}
                    className="UIDemo-AsyncDemo__container"
                />
            </div>

            <div className="UIDemo-AsyncDemo__column demo-AsyncDemo__loadLibrary">
                <span className="UIDemo-AsyncDemo__subHeader">
                    2. Асинхронная загрузка библиотеки
                </span>
                <div className="UIDemo-AsyncDemo__row">
                    Асинхронно загружается библиотека. После успешной загрузки меняется prop
                    компонента на значение "true".
                </div>
                <Async
                    componentName={componentName2}
                    componentProps={componentProps}
                    className="UIDemo-AsyncDemo__container"
                />
            </div>
        </div>
    );
}
