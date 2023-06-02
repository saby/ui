/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { Context, createContext } from 'react';
import { IFocusAreaProps } from './FocusArea';

const defaultValue: IFocusAreaProps = {
    tabIndex: 0,
};

export class FocusContextValue {
    private wasGetFocusPropsCalled: boolean = false;
    constructor(private focusProps: IFocusAreaProps = defaultValue) {}
    getFocusProps(): IFocusAreaProps {
        this.wasGetFocusPropsCalled = true;
        return this.focusProps;
    }
    arePropsTaken(): boolean {
        return this.wasGetFocusPropsCalled;
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
