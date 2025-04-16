// моки для получения мета информации по действию
export class ContextApi {
    static findAction(_actionName: string): unknown {
        return {
            actionName: 'actionName',
            title: 'title',
            icon: 'icon',
            blMethod: 'blMethod',
            jsMethod: 'UICore/Actions:MockForCurrentEmployeeTasksCountTasks',
            isStatic: false,
            params: {},
        };
    }
}
