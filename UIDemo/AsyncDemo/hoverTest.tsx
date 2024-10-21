import { createRef, useMemo, forwardRef } from 'react';
import { useHoverLoad } from 'UI/Async';
import 'css!UIDemo/AsyncDemo/Index';

const _modules = ['Browser/Event', 'ParametersWebAPI/Scope', 'Foo/Bar'];

function getLoadtext(data: Error | object) {
    if (data instanceof Error) {
        return data.message;
    }
    return Object.keys(data).join(',');
}

export default forwardRef<HTMLDivElement>(function HoverTest(_, ref) {
    const hoverRef = createRef<HTMLDivElement>();
    const delay = 2000;
    const { data } = useHoverLoad(_modules, hoverRef, delay);
    const result = useMemo(() => {
        if (data) {
            return _modules.map((item, index) => {
                return (
                    <div key={item}>
                        <span className="AsyncDemo-hoverTest__resultItemName">{item}</span>{' '}
                        {getLoadtext(data[index])}
                    </div>
                );
            });
        }
        return <div></div>;
    }, [data]);

    return (
        <div ref={ref}>
            <h1>Тест хука для загрузки статики по наведению мышки</h1>
            <div className="AsyncDemo-hoverTest" ref={hoverRef}>
                Наведи на этот блок и продержи курсор 2 секунды, чтобы началась загрузка модулей
                'Browser/Event', 'ParametersWebAPI/Scope', 'Foo/Bar'
            </div>
            <h3>Резальтаты загрузки</h3>
            {result}
        </div>
    );
});
