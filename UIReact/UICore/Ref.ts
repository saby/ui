/**
 * Библиотека цепочки рефов
 * @library UICore/Ref
 * @includes Responsibility UICore/_ref/Responsibility
 * @includes ChainOfRef UICore/_ref/ChainOfRef
 * @public
 */

export {
    IResponsibilityHandler,
    IResponsibility,
    IControlNode,
    IControlObj,
    Responsibility,
    CONTROL_NODE_HANDLER_TYPE,
    CONTROL_HANDLER_TYPE,
    ATTRIBUTES_HANDLER_TYPE,
    CHILDREN_HANDLER_TYPE,
    CLEAR_HANDLER_TYPE,
    EVENT_HANDLER_TYPE,
    NOTIFY_EVENT_TYPE,
    FOCUS_HANDLER_TYPE,
    INVISIBLE_NODE_HANDLER_TYPE,
    WHEEL_EVENT_HANDLER_TYPE,
    ORIGIN_HANDLER_TYPE,
} from './_ref/Responsibility';
export { ChainOfRef } from './_ref/ChainOfRef';
export { CreateOriginRef } from './_ref/CreateOriginRef';
