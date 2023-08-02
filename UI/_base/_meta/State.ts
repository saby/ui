/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import {
    IMetaState,
    IMeta,
    ISerializedMetaState,
    IMetaStateInternal,
    ITagDescription,
    IOpenGraph,
} from 'UI/_base/_meta/interface';
import TagMarkup from './TagMarkup';
const prefix = typeof window === 'undefined' ? 'ps-' : '';
let id = 1;
const generateGuid = () => {
    return `state-${prefix}${id++}`;
};
/**
 * @class UI/_base/_meta/State
 * @private
 * @implements UI/_base/_meta/IMetaState
 */
export default class State extends TagMarkup implements IMetaStateInternal {
    constructor(
        private _meta: IMeta,
        private readonly _guid: string = generateGuid(),
        private _nextStateId: string = void 0,
        private _prevStateId: string = void 0
    ) {
        super(getOgTagDescriptions(_meta.og, _guid));
    }

    //# region API
    getId(): string {
        return this._guid;
    }
    equal(state: IMetaState): boolean {
        return state.getId() === this._guid;
    }
    //# endregion

    serialize(): string {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const { _meta, _guid, _nextStateId, _prevStateId } = this;
        return JSON.stringify({ _meta, _guid, _nextStateId, _prevStateId });
    }

    getMeta(): IMeta {
        return this._meta;
    }

    getNextStateId(): string {
        return this._nextStateId;
    }

    setNextState(state: IMetaStateInternal | null): void {
        this._nextStateId = state?.getId();
    }

    getPrevStateId(): string {
        return this._prevStateId;
    }

    setPrevState(state: IMetaStateInternal | null): void {
        this._prevStateId = state?.getId();
    }
    /**
     * Десериализация состояния
     * @returns {ISerializedMetaState}
     * @example
     * const state = new State(meta);
     * deserializeState(state.serialize()).equal(state)) === true;
     */
    static deserialize(str: ISerializedMetaState): IMetaStateInternal | null {
        if (!str) {
            return null;
        }
        try {
            const { _meta, _guid, _nextStateId, _prevStateId } =
                JSON.parse(str);
            return new State(_meta, _guid, _nextStateId, _prevStateId);
        } catch {
            return null;
        }
    }
}

function getOgTagDescriptions(
    og: Partial<IOpenGraph> = {},
    guid: string
): ITagDescription[] {
    return Object.entries(og).map(([type, content]) => {
        return getOgTagDescription(type, content, guid);
    });
}

function getOgTagDescription(
    type: string,
    content: string,
    guid: string
): ITagDescription {
    return {
        tagName: 'meta',
        attrs: {
            property: `og:${type}`,
            class: guid,
            content,
        },
    };
}
