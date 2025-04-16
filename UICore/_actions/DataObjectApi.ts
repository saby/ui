import { IParamsValues } from 'UICore/_actions/Interfaces';
import { SbisService } from 'Types/source';
import { adapter, Record as RecordType } from 'Types/entity';
/**
 * запуск DataObject.Execute
 * @param actionPath
 * @param actionName
 * @param params
 */
export async function execute(
    actionPath: string[],
    actionName: string,
    params: IParamsValues
): Promise<unknown> {
    // инициализируем источник данных БЛ
    const dataSource = new SbisService({
        endpoint: 'DataObject', // название объекта БЛ
    });

    const record = RecordType.fromObject(params, new adapter.Sbis());
    const result = dataSource.call('Execute', {
        ObjectName: actionPath.join('.'),
        Method: actionName,
        Parameters: record,
    });
    return result;
}
