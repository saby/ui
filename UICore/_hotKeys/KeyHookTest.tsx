/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { EventHook } from 'UICore/EventCapture';
import { forwardRef, type ReactElement, Ref, useCallback } from 'react';
import { constants } from 'Env/Env';

interface IActionConfig {
    keyCode: number;
}
interface IProps {
    /**
     * Массив настроек действий по-умолчанию
     */
    defaultActions: IActionConfig[];
    context?: string;
    children: ReactElement;
}

const doNotDispatchTag: Record<string, number[]> = {
    textarea: [constants.key.del, constants.key.up, constants.key.down],
    input: [constants.key.del],
};
function checkTarget(target: Element, key: number): boolean {
    if (!target) {
        return true;
    }
    const keys = doNotDispatchTag[target.tagName.toLowerCase()];
    // если нашли среди клавиш запретную для тега, значит проверка не прошла
    return !(keys && keys.indexOf(key) > -1);
}

/**
 * Контрол KeyHook - контрол, который указывает клавиши, нажатие на которые будет обработано по умолчанию дочерним
 * контролом. Он регистрирует клавиши по умолчанию для всех предков, у которых еще нет зарегистрированного действия на
 * эту клавишу, и, в случае необработанного нажатия этих клавиш, в дочерний контрол будет перенаправлено событие о
 * нажатии на клавишу, и там будет обработано.
 * @public
 * @category ReactComponent
 * @example
 * Пример настройки горячих клавиш
 * <pre class="brush: js">
 * import { KeyHook } from 'UI/HotKeys';
 * import { constants } from 'Env/Env';
 * export function MyControl() {
 *   const defaultActions = [
 *         { keyCode: constants.key.up },
 *         { keyCode: constants.key.down },
 *     ];
 *   return (
 *     <KeyHook defaultActions={ defaultActions }>
 *       // some content
 *     </KeyHook>
 *   )
 * }
 * </pre>
 */
function KeyHook(props: IProps, ref: Ref<unknown>) {
    const { defaultActions, context, children, ...rest } = props;

    const catchEvent = useCallback(
        function catchEvent(event: Event): boolean {
            const key: number = (event as KeyboardEvent).which ?? (event as KeyboardEvent).keyCode;
            // клавиша таб не может быть клавишей по умолчанию, у нее есть конкретное предназначение - переход по табу
            if (key === constants.key.tab) {
                return false;
            }
            // в случае когда фокус находится внутри элемента, который имеет нативное поведение на клавиши
            // мы не должны стрелять событиями горячих клавиш
            if (!checkTarget(event.target as Element, key)) {
                return false;
            }

            return defaultActions.some((actionConfig) => {
                return actionConfig.keyCode === key;
            });
        },
        [defaultActions]
    );

    // todo if (adaptiveMode.device.isTouch()) return {children};

    return (
        <EventHook ref={ref} catchEvent={catchEvent} context={context} {...rest}>
            {children}
        </EventHook>
    );
}
export default forwardRef(KeyHook);
