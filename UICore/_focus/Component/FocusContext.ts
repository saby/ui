/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { Context, createContext } from 'react';
import { IFocusAreaProps } from './FocusArea';

export const defaultValue: IFocusAreaProps = {
    tabIndex: 0,
};
Object.freeze(defaultValue);

export class FocusContextValue {
    constructor(private focusProps: IFocusAreaProps | undefined = defaultValue) {}
    getFocusProps(): IFocusAreaProps | undefined {
        const focusProps = this.focusProps;
        this.focusProps = undefined;
        return focusProps;
    }
    arePropsTaken(): boolean {
        return !this.focusProps;
    }
}

export type TFocusContext = Context<FocusContextValue>;

let focusContext: TFocusContext;

export function getFocusContext(): TFocusContext {
    if (!focusContext) {
        focusContext = createContext(new FocusContextValue(defaultValue));
    }
    return focusContext;
}
