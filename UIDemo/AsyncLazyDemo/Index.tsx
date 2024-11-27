import { forwardRef, Ref } from 'react';
import LoadModules from './_index/LoadModules';
import ComponentProps from './_index/ComponentProps';
import LoadFail from './_index/LoadFail';
import 'css!UIDemo/AsyncDemo/Index';

const Index = forwardRef(function Index(_, ref: Ref<HTMLDivElement>) {
    return (
        <div className="UIDemo-AsyncDemo" ref={ref}>
            <h3 className="UIDemo-AsyncDemo__headerMain">Демо UI/Async:Async</h3>

            <LoadModules />

            <div className="UIDemo-AsyncDemo__column demo-AsyncDemo__internalOptColumn">
                <span className="UIDemo-AsyncDemo__subHeader">3. Internal props</span>
                <div className="UIDemo-AsyncDemo__row">
                    Демонстрация перестроения компонента при изменении props загруженного
                    компонента.
                </div>
                <ComponentProps />
            </div>

            <div className="UIDemo-AsyncDemo__column demo-AsyncDemo__loadFailColumn">
                <span className="UIDemo-AsyncDemo__subHeader">
                    4. 'Дружелюбная ошибка' (просто текст) при проблеме загрузки
                </span>
                <div className="UIDemo-AsyncDemo__row">
                    Попытка загрузить несуществующий модуль. В таком случае будет показан
                    дружелюбный текст ошибки: "У СБИС возникла проблема".
                </div>
                <LoadFail />
            </div>
        </div>
    );
});

export default Index;
