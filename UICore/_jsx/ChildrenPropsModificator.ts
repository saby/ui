/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { ReactElement, ForwardedRef, JSXElementConstructor } from 'react';
import { TInternalProps } from 'UICore/Executor';

type TChildrenTypeChecker<
    P = unknown,
    T extends string | JSXElementConstructor<P> = string | JSXElementConstructor<P>
> = (children: ReactElement) => children is ReactElement<P, T>;

type TChildrenTypeModificator<
    P = unknown,
    T extends string | JSXElementConstructor<P> = string | JSXElementConstructor<P>
> = (children: ReactElement<P, T>, nextProps: unknown, forwardRef: ForwardedRef<unknown>) => P;

export type TRefType = ForwardedRef<unknown>;

export interface IClonedChildProps {
    [key: string]: Function | unknown;
    forwardedRef?: TRefType;
    ref?: TRefType;
    attrs?: Record<string, unknown>;
}
export interface IInternalPropsWithWasabyChildren extends TInternalProps {
    children: ReactElement<IClonedChildProps> & {
        ref?: TRefType;
    };
    content: unknown;
}

/**
 * Класс, реализующий стратегию модицикации пропсов.
 * @private
 */
export class ChildrenPropsModificatorStratagy {
    constructor(
        public shouldUseIt: TChildrenTypeChecker,
        public doAction: TChildrenTypeModificator
    ) {}
}

/**
 * Класс, работающий со стратегиями модификации пропсов.
 * Стратегия выбирается по принципу "last in, first out".
 * Так что первой необходимо запушить ту, которая будет проверяться последней.
 * @private
 */
class ChildrenPropsModificator {
    private strategies: ChildrenPropsModificatorStratagy[] = [];

    modifyChildrenProps(
        children: ReactElement,
        nextProps: unknown,
        nextRef: ForwardedRef<unknown>
    ): IClonedChildProps {
        const action = this.chooseRightAction(children);
        if (!action) {
            return {};
        }
        return action(children, nextProps, nextRef) as IClonedChildProps;
    }
    pushStrategy(stratagy: ChildrenPropsModificatorStratagy): void {
        this.strategies.push(stratagy);
    }

    protected chooseRightAction(children: ReactElement): TChildrenTypeModificator {
        for (let i = this.strategies.length - 1; i >= 0; i--) {
            const strategy = this.strategies[i];
            if (strategy.shouldUseIt(children)) {
                return strategy.doAction;
            }
        }
    }
}

export const childrenPropsModificatorSingleton = new ChildrenPropsModificator();
