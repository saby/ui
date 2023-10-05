import { Attr } from 'UICommon/Executor';
import { wasabyAttrsToReactDom } from '../_Markup/Attributes';
import { processMergeAttributes } from '../_Utils/Attr';

/**
 * Копия метода из UICommon/Executor:TClosure.plainMergeAttr
 * сделано из-за того, что в этом методе приходится использовать метод wasabyAttrsToReactDom
 */
export function plainMergeAttr(inner, object) {
    if (!inner) {
        inner = {};
    }
    if (!object) {
        object = {};
    }

    /*
     * Атрибуты из шаблона не нужны в VDom контролах
     * */
    if (
        object.attributes &&
        Object.keys(object.attributes).length === 2 &&
        object.attributes.name === object.attributes.sbisname &&
        object.attributes.sbisname !== undefined
    ) {
        // eslint-disable-next-line no-param-reassign
        object = {};
    }

    let controlKey;
    if (object.attributes && object.attributes.key) {
        controlKey = object.attributes.key;
    }
    controlKey = controlKey || object.key || inner.key;

    const res = {
        inheritOptions: object.inheritOptions,
        context: inner.context,
        internal: inner.internal,
        systemOptions: {},
        domNodeProps: {},
        key: controlKey,
        attributes: processMergeAttributes(
            inner.attributes,
            wasabyAttrsToReactDom(object.attributes, false)
        ),
        events: Attr.mergeEvents(inner.events, object.events),
        // прокинем родителя, в случае инлайн шаблонов родитель прокидываем сверху
        _physicParent: inner._physicParent,
        _isRootElement: inner._isRootElement,
        isContainerNodeInline: inner.isContainerNodeInline,
    };
    // прокидываем refForContainer глубже только если строится инлайн шаблон и он в корне
    if (inner._isRootElement || inner.isContainerNodeInline) {
        res.refForContainer = inner.refForContainer;
    }
    return res;
}
