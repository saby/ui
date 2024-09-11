/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { delay } from 'Types/function';

// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const NODE_TYPE_ELEMENT = 1;

export default class AfterUpdateDecorator {
    execute(instance, oldOptions) {
        // если в процессе afterUpdate были добалены новые контролы, то мы должны дождаться их построения
        // т.к. в afterUpdate может быть обращение к этим детям
        // ситуация возможна в совсместимости, когда черезе createControl создают wasaby-контрол в ws3
        if (this.hasNotMoutedChild(instance)) {
            return delay(() => {
                return instance._afterUpdate(oldOptions);
            });
        }
        return instance._afterUpdate(oldOptions);
    }

    private hasNotMoutedChild(instance): boolean {
        for (const childName of Object.keys(instance._children)) {
            const child = instance._children[childName];
            if (child.nodeType === NODE_TYPE_ELEMENT) {
                continue;
            }
            if (!child._mounted) {
                return true;
            }
        }
        return false;
    }
}
