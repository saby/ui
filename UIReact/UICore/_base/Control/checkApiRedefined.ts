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

export function checkReactApiRedefined<TOptions, TState>(
    control: Control<TOptions, TState>
): string[] {
    const api = [];
    // todo отлавливать моменты, когда апи инициализируется прямо в состояние за исключением мест в UI/Base:Control
    for (const apiName of reactComponentApi) {
        if (control.constructor.prototype.hasOwnProperty(apiName)) {
            api.push(apiName);
        }
    }
    return api;
}
