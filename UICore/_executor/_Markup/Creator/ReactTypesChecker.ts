/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import type {
    ComponentType,
    MemoExoticComponent,
    ForwardRefExoticComponent,
    ReactElement,
    ComponentClass,
    FunctionComponent,
    Consumer,
    Provider,
} from 'react';

const REACT_FIBER_FIELD = '$$typeof';
const SYMBOL_REACT_ELEMENT = Symbol.for('react.element');
const SYMBOL_REACT_MEMO = Symbol.for('react.memo');
const SYMBOL_REACT_FORWARD_REF = Symbol.for('react.forward_ref');
const SYMBOL_REACT_CONTEXT_PROVIDER = Symbol.for('react.provider');
const SYMBOL_REACT_CONTEXT_CONSUMER = Symbol.for('react.context');

export function isReactElement(component: unknown): component is ReactElement {
    return component && component[REACT_FIBER_FIELD] === SYMBOL_REACT_ELEMENT;
}

function isReactMemo(component: unknown): component is MemoExoticComponent<ComponentType> {
    return component && component[REACT_FIBER_FIELD] === SYMBOL_REACT_MEMO;
}

/**
 * Когда в генератор приходит memo, мы должны понимать, что именно мемоизировано.
 * По сути, memo - это ХОК, который позволяет убрать лишние перерисовки какого-то компонента.
 * В него развершается обернуть хоть классовый, хоть фукнциональный компонент.
 * @private
 */
function getRealComponentFromMemo(component: unknown): ComponentType {
    let realComponent: ComponentType = component as ComponentType;
    while (isReactMemo(realComponent)) {
        realComponent = realComponent.type;
    }
    return realComponent;
}

/**
 * Проверка, является ли компонент forwardRef. Даже если он обёрнут в memo.
 * @public
 */
export function isForwardRef(component: unknown): component is ForwardRefExoticComponent<unknown> {
    const realComponent = getRealComponentFromMemo(component);
    return realComponent && realComponent[REACT_FIBER_FIELD] === SYMBOL_REACT_FORWARD_REF;
}

/**
 * Проверка, является ли компонент классовым. Даже если он обёрнут в memo.
 * @public
 */
export function isComponentClass(component: unknown): component is ComponentClass {
    const realComponent = getRealComponentFromMemo(component);
    const prototype = realComponent?.prototype;
    if (prototype) {
        return typeof prototype.render === 'function';
    }
    return false;
}

/**
 * Проверка, является ли компонент Context.Consumer. Даже если он обёрнут в memo.
 * @public
 */
export function isContextConsumer(component: unknown): component is Consumer<unknown> {
    const realComponent = getRealComponentFromMemo(component);
    return realComponent && realComponent[REACT_FIBER_FIELD] === SYMBOL_REACT_CONTEXT_CONSUMER;
}

/**
 * Проверка, является ли компонент Context.Provider. Даже если он обёрнут в memo.
 * @public
 */
export function isContextProvider(component: unknown): component is Provider<unknown> {
    const realComponent = getRealComponentFromMemo(component);
    return realComponent && realComponent[REACT_FIBER_FIELD] === SYMBOL_REACT_CONTEXT_PROVIDER;
}

const noPropsComponentLength = 0;
const withPropsComponentLength = 1;

/**
 * Проверка, является ли компонент функциональным. Даже если он обёрнут в memo.
 * @public
 */
export function isFunctionComponent(component: unknown): component is FunctionComponent {
    const realComponent = getRealComponentFromMemo(component);
    if (typeof realComponent !== 'function') {
        return false;
    }

    // Обычный классовый компонент может пройти проверку ниже,
    // потому что length класса - это число аргументов в конструкторе.
    // И даже в современном ES typeof класса возвращает 'function';
    if (isComponentClass(realComponent)) {
        return false;
    }

    // Главная задача isFunctionComponent - отличить функциональный компонент от шаблонной функции.
    // У шаблонной функции всегда 7 аргументов, у функционального компонента - 0 или 1.
    // Никак иначе функциональный компонент от какой-то другой функции не отличить (разве что флаги вешать).
    return (
        realComponent.length === noPropsComponentLength ||
        realComponent.length === withPropsComponentLength
    );
}

export function isReactComponentType(component: unknown): component is ComponentType {
    return (
        isReactMemo(component) ||
        isComponentClass(component) ||
        isForwardRef(component) ||
        isFunctionComponent(component)
    );
}
export function isValidChildren(children: React.ReactNode): boolean {
    if (!children) {
        return false;
    }
    if (isReactElement(children)) {
        return true;
    }
    if (Array.isArray(children)) {
        for (const child of children) {
            if (!isReactElement(child)) {
                return false;
            }
        }
        return true;
    }
    return false;
}
