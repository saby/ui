/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { IMeta, IMetaState, IMetaStack } from 'UI/_base/_meta/interface';
import { default as Stack } from 'UI/_base/_meta/Stack';
import { IResourceDisposable } from 'Application/State';

const getMetaStack: () => IMetaStack = Stack.getInstance;
/**
 * Класс-Ресурс, который отвечает за обновление, удаление метаданных
 * @implements Application/_State/IResourceDisposable
 * @public
 */
export class ResourceMeta implements IResourceDisposable {
    private _metaState: IMetaState;
    constructor(private meta: IMeta) {}
    enter(): void {
        this._metaState = getMetaStack().push(this.meta);
    }
    dispose(): void {
        getMetaStack().remove(this._metaState);
    }
}
