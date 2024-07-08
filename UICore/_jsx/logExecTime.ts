/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-this-alias */
/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { logger, location } from 'Application/Env';
import type { TWasabyOverReactProps, Control } from 'UICore/Base';

type LogTimepestampStart = number;
interface IAsyncProps extends TWasabyOverReactProps {
    templateName: string;
}

function isAsyncContainer(C: unknown, name: string): C is Control<IAsyncProps, unknown> {
    if (name === 'Controls/Container/Async') {
        return true;
    }
    return false;
}

const REACT_FIBER_FIELD = '$$typeof';
const REACT_RENDER_FIELD = 'render';
const REACT_FRAGMENT_DESCRIPTION_FIELD = 'description';
const REACT_FRAGMENT = 'react.fragment';

type TLogComponent =
    | { _logicParent?: TLogComponent; _moduleName?: string }
    | {
          [REACT_FIBER_FIELD]?: string;
          [REACT_RENDER_FIELD]?: Function;
          displayName?: string;
      }
    | (Function & { displayName?: string })
    | { [REACT_FRAGMENT_DESCRIPTION_FIELD]?: string };

function getControlName(control: TLogComponent): string {
    if (control[REACT_FIBER_FIELD] && control[REACT_RENDER_FIELD]) {
        // @ts-ignore ошибка type guard
        return control.displayName || control[REACT_RENDER_FIELD].name;
    }

    if (typeof control === 'function') {
        return control.displayName || control.name;
    }

    // @ts-ignore ошибка type guard
    let name: string | false = control._moduleName ?? false;
    if (!name) {
        return '';
    }
    if (isAsyncContainer(control, name)) {
        name += ` с templateName равным "${control.props.templateName}"`;
    }
    return name;
}

function logEndRender(component: TLogComponent, duration: number): void {
    const name = getControlName(component);
    const extendedName =
        '_logicParent' in component && component._logicParent
            ? `Контрол ${name}, объявленный внутри контрола ${getControlName(
                  component._logicParent
              )},`
            : `Контрол ${name}`;
    logger.info(`${extendedName} был построен за ${duration} мс`);
}

export let logExecutionTimeBegin = () => {
    return 0;
};

export let logExecutionTimeEnd = (component: TLogComponent, start: LogTimepestampStart) => {
    return undefined;
};

if (typeof window === 'undefined') {
    const QUERY_ENABLE_LOG_F = '?SBIS_EXEC_TIME_LOG=1';
    const QUERY_ENABLE_LOG_S = '&SBIS_EXEC_TIME_LOG=1';
    const NO_LOG = -1;
    /* eslint-disable-next-line @typescript-eslint/no-shadow */
    logExecutionTimeBegin = function logExecutionTimeBegin(): LogTimepestampStart {
        if (
            !location.search.includes(QUERY_ENABLE_LOG_F) &&
            !location.search.includes(QUERY_ENABLE_LOG_S)
        ) {
            return NO_LOG;
        }
        return Date.now();
    };

    /* eslint-disable-next-line @typescript-eslint/no-shadow */
    logExecutionTimeEnd = function logExecutionTimeEnd(
        component: TLogComponent,
        start: LogTimepestampStart
    ): void {
        if (start === NO_LOG) {
            return;
        }
        if (typeof component === 'string') {
            return;
        }
        if (component[REACT_FRAGMENT_DESCRIPTION_FIELD] === REACT_FRAGMENT) {
            return;
        }
        logEndRender(component, Date.now() - start);
    };
}
