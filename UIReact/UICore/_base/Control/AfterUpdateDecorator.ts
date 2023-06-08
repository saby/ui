import { delay } from 'Types/function';

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
        let hasNotMoutedChild = false;
        for (const childName of Object.keys(instance._children)) {
            const child = instance._children[childName];
            if (!child._mounted) {
                hasNotMoutedChild = true;
            }
        }
        return hasNotMoutedChild;
    }
}
