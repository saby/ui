/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import { pauseErrorWrongUpdater, ReactiveUpdateManager } from './ReactiveUpdateManager';
import {
    observeArrayChange,
    unobserveArrayChange,
    unobserveAllArrayChanges,
} from './ArrayChangeObserver';
import {
    observeVersionChange,
    unobserveVersionChange,
    unobserveAllVersionChanges,
} from './VersionChangeObserver';

interface IVersionable {
    getVersion(): number;
}
function isVersionable(value: unknown): value is IVersionable {
    return value && typeof value._version === 'number';
}

type TControl = Partial<
    Control<unknown, unknown> & {
        controlUpdater: (changedFieldName: string) => void; // функция вызова _forceUpdate
        reactiveValues: Record<string, unknown>; // Объект для хранения реактивных значений
        scopeReactiveValues: Record<string, unknown>; // Объект для хранения реактивных значений в скоупе.
    }
>;

const controlsUpdateMap: Map<TControl, ReactiveUpdateManager> = new Map();
function createReactiveUpdateManager(instance: TControl): ReactiveUpdateManager {
    const reactiveUpdateManager = new ReactiveUpdateManager();
    reactiveUpdateManager.setUpdater(instance.controlUpdater, instance._moduleName);
    controlsUpdateMap.set(instance, reactiveUpdateManager);
    return reactiveUpdateManager;
}
function getReactiveUpdateManager(instance: TControl): ReactiveUpdateManager {
    return controlsUpdateMap.get(instance) || createReactiveUpdateManager(instance);
}

/**
 * Запуск реактивности в WasabyReact компоненте
 * @param instance - Инстанс компонента, который необходимо перерисовывать
 */
export function makeWasabyObservable(
    instance: TControl,
    controlUpdater: TControl['controlUpdater']
): void {
    if (!instance.reactiveValues) {
        instance.reactiveValues = {};
        instance.scopeReactiveValues = {};
        instance.controlUpdater = controlUpdater;
        createReactiveUpdateManager(instance);
    }
    observeTemplate(instance);
    observeProperties(instance);
}

/**
 * Подписка на изменение шаблона, при этом необходимо почистить старые подписки и подписаться на изменения новых
 * реактивных свойств
 * @param instance
 */
function observeTemplate(instance: TControl): void {
    // @ts-ignore _template сейчас _protected
    let templateFunction = instance._template;
    Object.defineProperty(instance, '_template', {
        enumerable: true,
        configurable: true,
        get(): TemplateFunction {
            return templateFunction;
        },
        set(newTemplateFunction: TemplateFunction): void {
            // Присваивание нового _template после дестроя с кодом ниже вызывает утечку памяти.
            if (instance._destroyed) {
                templateFunction = newTemplateFunction;
                return;
            }
            if (
                newTemplateFunction !== templateFunction &&
                newTemplateFunction &&
                newTemplateFunction.reactiveProps
            ) {
                releaseProperties(instance);
                templateFunction = newTemplateFunction;
                observeProperties(instance);
                getReactiveUpdateManager(instance).callHandler('_template');
            }
        },
    });
}

function getPropertiesToObserve(instance: TControl): string[] {
    // @ts-ignore _template сейчас _protected
    const props = instance?._template?.reactiveProps || [];
    return props;
}

/**
 * Подписка на изменение свойств компонента
 * @param instance - Инстанс компонента
 */
function observeProperties(instance: TControl): void {
    const props = getPropertiesToObserve(instance);
    for (const propName of props) {
        observeValue(instance, propName);
    }
}

/**
 * Проверка, если тип свойства мутабельный (Array, Record, RecordSet), то необходимо вызвать для них соответственные методы
 * @param value - Значение свойства
 * @param instance - Инстанс компонента
 * @param propName - Имя свойства
 */
function observeMutableTypes(value: unknown, instance: TControl, propName: string): void {
    pauseErrorWrongUpdater(() => {
        if (Array.isArray(value)) {
            observeArrayChange(value, instance.controlUpdater, instance._moduleName, propName);
            return;
        }
        if (isVersionable(value)) {
            observeVersionChange(
                value,
                instance.controlUpdater,
                instance._moduleName,
                `${propName} ._version`
            );
        }
    });
}

function unobserveMutableTypes(value: unknown, instance: TControl): void {
    pauseErrorWrongUpdater(() => {
        if (Array.isArray(value)) {
            unobserveArrayChange(value, instance.controlUpdater);
            return;
        }
        if (isVersionable(value)) {
            unobserveVersionChange(value, instance.controlUpdater);
        }
    });
}

/**
 * Свойства могут содержать сложные объекты (массивы, объекты, модели). Становясь реактивными,
 * они помечаются специальным образом, чтобы реактивность на свойство была настроена только для самого
 * внешнего контрола. Когда контрол дестроится, нужно снять пометки с таких объектов,
 * чтобы они могли быть зарегистрированы при перерисовке для другого контрола.
 * Необходимо вызывать метод, когда экземпляр дестроится и когда присваивается новый шаблон.
 * @param instance
 */
export function releaseProperties(instance: TControl): void {
    const reactiveProps = getPropertiesToObserve(instance);
    const reactiveUpdateManager = controlsUpdateMap.get(instance);
    if (!reactiveUpdateManager) {
        return;
    }
    unobserveAllArrayChanges(instance.controlUpdater);
    unobserveAllVersionChanges(instance.controlUpdater);
    reactiveUpdateManager.unsetUpdater(instance.controlUpdater);
    controlsUpdateMap.delete(instance);

    for (const propName of reactiveProps) {
        unobserveValue(instance, propName);
    }
    instance.reactiveValues = {};
    instance.scopeReactiveValues = {};
}

function observeValue(instance: TControl, propName: string) {
    const value = instance[propName];
    instance.reactiveValues[propName] = value;
    observeMutableTypes(value, instance, propName);

    const descriptor = getDescriptor(instance, propName);
    Object.defineProperty(instance, propName, {
        enumerable: true,
        configurable: true,
        set(newValue: unknown): void {
            if (descriptor?.set) {
                descriptor.set.apply(this, arguments);
            }
            // Создаем новый объект для скопированного scope из генератора, например для инлайн шаблонов
            if (!this.hasOwnProperty('reactiveValues')) {
                this.reactiveValues = Object.create(this.reactiveValues);
                this.isCloneOfControl = true;
            }
            const curValue = this.reactiveValues[propName];
            // делаем проверку с учетом NaN === NaN, что всегда false.
            if (curValue !== newValue && !(Number.isNaN(curValue) && Number.isNaN(newValue))) {
                unobserveMutableTypes(curValue, instance);
                if (this.isCloneOfControl) {
                    // Очередной костыль реактивности объекта на скоупе.
                    // TODO https://online.sbis.ru/opendoc.html?guid=bf61f397-ad02-4acc-9478-2b7f8619f354
                    unobserveMutableTypes(instance.scopeReactiveValues[propName], instance);
                    instance.scopeReactiveValues[propName] = newValue;
                }
                this.reactiveValues[propName] = newValue;
                observeMutableTypes(newValue, instance, propName);
                // Для скопированного scope не нужно вызывать реактивность.
                if (!this.isCloneOfControl) {
                    getReactiveUpdateManager(instance).callHandler(propName);
                }
            }
        },
        get(): unknown {
            if (descriptor?.get) {
                return descriptor.get.apply(this, arguments);
            }
            return this.reactiveValues[propName];
        },
    });
}

function unobserveValue(instance: TControl, propName: string): void {
    if (!instance.reactiveValues.hasOwnProperty(propName)) {
        return;
    }
    const value = instance.reactiveValues[propName];
    Object.defineProperty(instance, propName, {
        value,
        configurable: true,
        writable: true,
        enumerable: true,
    });
}

/**
 * get descriptor of property
 * @param {Object} _obj object having propery
 * @param {String} prop name of property
 * @returns {*} descriptor
 */
function getDescriptor(_obj: object, prop: string): PropertyDescriptor {
    let res = null;
    let obj = _obj;
    while (obj) {
        res = Object.getOwnPropertyDescriptor(obj, prop);
        obj = Object.getPrototypeOf(obj);

        // нашли дескриптор
        if (res) {
            break;
        }
    }
    return res;
}
