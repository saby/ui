// моки для получения мета информации по действию
import { IActionConfig } from './Interfaces';

export class ContextApi {
    static findAction(fullPath: string): IActionConfig {
        // todo костыль, должно исправиться с проектом Азамата и Сергея про контексты.
        //  https://project.sbis.ru/uuid/48244ba4-74c4-4841-a8fd-fee17e3b2439/page/project-main
        //  и тогда надо будет попросить чтобы Агафонцев возвращал данные по действию с уже поправленным actionPath
        //  https://online.sbis.ru/page/dialog/95a3bfd3-3cba-4071-8a7e-cc36a0539c3e?inviteduser=8619c702-3e02-4c65-9cab-002183de664a
        //  если нужно будет более мощное исправление пути, я писал код по корректному исправлению,
        //  но применять можно только там где уже подгружены необходимые конструкторы и положены в Store
        //  ветка 25.2000/bugfix/repair-dataobject-name в Controls
        fullPath = fullPath.replace(/^Current/, '');

        const actionPathArray = fullPath.split('.');
        const actionPath = actionPathArray.slice(0, actionPathArray.length - 1);
        const actionName = actionPathArray[actionPathArray.length - 1];
        return {
            actionPath,
            actionName,
            title: 'title',
            icon: 'icon',
            blMethod: 'blMethod',
            jsMethod: 'UICore/Actions:MockForCurrentEmployeeTasksCountTasks',
            isStatic: false,
            params: {},
        };
    }
}
