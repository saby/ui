/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { Control } from 'UICore/Base';
import { dispatcherHandler } from './dispatcherHandlerTest';
import * as template from 'wml!UICore/_hotKeys/Dispatcher';
import { TemplateFunction } from 'UICommon/Base';

/**
 * Контрол выделяет область, в которой будут перехватываться клавиши и перенаправляться на обработку дочернему контролу,
 * который зарегистрировал себя на обработку этих клавиш с помощью контрола UICore/HotKeys:KeyHook.
 * Облатсь содержимого body также выделена контролом UICore/HotKeys:Dispatcher
 * @extends UICore/Base:Control
 * @public
 * @deprecated
 */
class Dispatcher extends Control {
    protected _template: TemplateFunction = template;
    keyDownHandler(event: Parameters<typeof dispatcherHandler>[0]): void {
        return dispatcherHandler(event);
    }
}

export default Dispatcher;
