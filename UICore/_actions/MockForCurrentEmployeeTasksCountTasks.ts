import { JsMethod } from './JsMethod';
export class MockForCurrentEmployeeTasksCountTasks extends JsMethod {
    afterExecute(res: { toJSON: Function }) {
        if (res?.toJSON && typeof (res as { toJSON: unknown }).toJSON === 'function') {
            window.alert(JSON.stringify((res as { toJSON: Function }).toJSON()));
        }
    }
}
