import {
    IMeta,
    IMetaState,
    IMetaStackInternal,
    ISerializedMetaStack,
    ISerializedMetaState,
    IMetaStateInternal,
} from 'UI/_base/_meta/interface';
import { mountState, unmountState } from 'UI/_base/_meta/DOMmanipulator';
import State from 'UI/_base/_meta/State';
import { createStatesStore, IStates } from 'UI/_base/_meta/Store';
import { getStore as getEnvStore } from 'Application/Env';
import { IStore } from 'Application/Interface';

/**
 * Хранилище meta-данных страницы
 * @class UI/_base/_meta/Stack
 * @public
 * @implements UI/_base/_meta/IMetaStack
 */
export default class Stack implements IMetaStackInternal {
    get lastState(): IMetaStateInternal {
        return this._getLastDataStore().get('lastState');
    }

    set lastState(state: IMetaStateInternal) {
        unmountState(this._getLastDataStore().get('headTagIds'));
        this._getLastDataStore().set('headTagIds', mountState(state));
        this._getLastDataStore().set('lastState', state);
    }

    constructor(
        private getStore: () => IStore<IStates>,
        lastState?: IMetaStateInternal
    ) {
        if (lastState) {
            this._getLastDataStore().set('lastState', lastState);
        }
        this.push = this.push.bind(this);
        this.remove = this.remove.bind(this);
    }

    private _getLastDataStore(): IStore<Record<string, any>> {
        return getEnvStore('meta-stack-last-data');
    }

    //# region API
    push(meta: IMeta): IMetaState {
        const state = new State(meta);
        this.linkState(state);
        this.storeState(state);
        this.lastState = state;
        return state;
    }

    remove(externalState: IMetaState): void {
        if (!externalState) {
            return;
        }
        const state = this.getStateById(externalState.getId());
        if (!state) {
            return;
        }
        this.unlinkState(state);
        this.removeState(state);
    }
    //# endregion

    serialize(): string {
        const ser = this.getStore()
            .getKeys()
            .map((id) => {
                return this.getStateById(id).serialize();
            });
        return JSON.stringify(ser);
    }

    private linkState(state: IMetaStateInternal): void {
        state.setPrevState(this.lastState);
        if (!this.lastState) {
            this.lastState = state;
            return;
        }
        this.lastState.setNextState(state);
    }
    private unlinkState(state: IMetaStateInternal): void {
        const prev = this.getStateById(state.getPrevStateId());
        const next = this.getStateById(state.getNextStateId());
        if (!prev && !next) {
            throw new Error('Удаление последнего state!');
        }
        // у начального state нет предыдущего state
        prev?.setNextState(next);
        if (!next) {
            // если удаляется крайний state
            this.lastState = prev;
            return;
        }
        next.setPrevState(prev);
    }
    private getStateById(id: string): IMetaStateInternal | null {
        return this.getStore().get(id) || null;
    }
    private removeState(state: IMetaStateInternal): void {
        this.getStore().remove(state.getId());
    }
    private storeState(state: IMetaStateInternal): void {
        this.getStore().set(state.getId(), state);
    }

    private static instance: Stack;
    static getInstance(): Stack {
        if (Stack.instance) {
            return Stack.instance;
        }
        return (Stack.instance = new Stack(createStatesStore()));
    }

    /**
     * Десериализация stack'a
     * @param {ISerializedMetaStack} str сериализованный стек
     * @returns {IMetaStack}
     * @private
     */
    static restore(str: ISerializedMetaStack): IMetaStackInternal {
        if (!str) {
            return null;
        }
        const states: IStates = {};
        try {
            const statesArr = (JSON.parse(str) as ISerializedMetaState[])
                .map((stateSer) => {
                    return State.deserialize(stateSer);
                })
                .filter((state) => {
                    return state !== null;
                });
            statesArr.forEach((state) => {
                states[state.getId()] = state;
            });
            return (Stack.instance = new Stack(
                createStatesStore(states),
                statesArr[statesArr.length - 1]
            ));
        } catch {
            return null;
        }
    }
}
