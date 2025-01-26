import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { IActionConfig, IActionStartOptions } from './Interfaces';
import { JsMethod } from './JsMethod';
import { logger } from 'Application/Env';
import { ContextApi } from './MockTypeServiceApi';
import * as DataObjectApi from './DataObjectApi';

export class ActionStarter {
    actionOptions: IActionStartOptions;

    constructor(actionOptions: IActionStartOptions) {
        this.actionOptions = actionOptions;
        this.start = this.start.bind(this);
    }
    async start() {
        const action = ContextApi.findAction(this.actionOptions.id);
        // todo нужна проверка что действие которое нашли действительно IActionConfig а не результат выполнения на сервере
        if (
            typeof action === 'object' &&
            action !== null &&
            (action.hasOwnProperty('jsMethod') || action.hasOwnProperty('blMethod'))
        ) {
            return this.execute(action as IActionConfig);
        }
        // вернули не метаданные действия, считаем что действие уже выполнили на сервере и вернули результат
        // todo нужно ли все равно чтобы вернули действие, но с результатом, чтобы вызвать на клиенте afterExecute
        return action;
    }
    async execute(action: IActionConfig): Promise<unknown> {
        if (action.jsMethod) {
            const JsMethodClass = (await ModulesLoader.loadAsync(
                action.jsMethod
            )) as typeof JsMethod;
            if (JsMethodClass?.prototype && JsMethodClass.prototype instanceof JsMethod) {
                const jsMethod = new JsMethodClass();
                if (jsMethod.canExecute()) {
                    const params = await jsMethod.getParams(action, this.actionOptions.actionProps);
                    const result = await jsMethod.execute(this.actionOptions.id, params);
                    jsMethod.afterExecute?.(result);
                }
                return;
            } else {
                logger.error(
                    'UI/Actions:ActionStarter: Невозможно запустить объявленную в действии js-реализацию, так как она унаследована от UI/Actions:JsMethod'
                );
                return;
            }
        }

        if (action.blMethod) {
            // запускаем DataObject.Execute - предполагаем, что внутри он запускает только бл-метод
            DataObjectApi.execute(this.actionOptions.id, this.actionOptions.actionProps || {});
        } else {
            logger.error(
                'UI/Actions:ActionStarter: Невозможно выполнить действие, нет ни js-реализации действия, ни бл-метода'
            );
        }
    }
}
