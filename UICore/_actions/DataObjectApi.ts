import { IParamsValues } from 'UICore/_actions/Interfaces';
import { DataSet, SbisService } from 'Types/source';
import { adapter, Record } from 'Types/entity';

/**
 * запуск DataObject.Execute
 * @param id
 * @param params
 */
export async function execute(id: string, params: IParamsValues): Promise<unknown> {
    const method = id.split('.');
    // инициализируем источник данных БЛ
    const dataSource = new SbisService({
        endpoint: 'DataObject', // название объекта БЛ
    });

    const record = Record.fromObject(params, new adapter.Sbis());

    const res: DataSet<any> = await dataSource.call('Execute', {
        ObjectName: method
            .slice(0, method.length - 1)
            .join('.')
            .replace(/^Current/, ''),
        Method: method[method.length - 1],
        Parameters: record,
    });
    return res;
}
