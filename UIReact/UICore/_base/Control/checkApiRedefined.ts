import type Control from '../Control';

const reactComponentApi = [
    'state',
    'setState',
    'props',
    'context',
    'render',
    'shouldComponentUpdate',
    'componentDidMount',
    'componentDidUpdate',
    'componentWillUnmount',
    'getSnapshotBeforeUpdate',
    'forceUpdate',
];
const staticReactComponentApi = [
    'contextType',
    'UNSAFE_isReact',
    'isWasaby'
];

export function checkReactApiRedefined<TOptions, TState>(
    control: Control<TOptions, TState>,
    BaseControl
): string[] {
    const api = [];
    // todo отлавливать моменты, когда апи инициализируется прямо в состояние за исключением мест в UI/Base:Control
    for (const apiName of reactComponentApi) {
        if (control.constructor.prototype[apiName] !== BaseControl.prototype[apiName]) {
            api.push(apiName);
        }
    }
    for (const apiName of staticReactComponentApi) {
        if (control.constructor[apiName] !== BaseControl[apiName]) {
            api.push(apiName);
        }
    }
    return api;
}
