/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Модуль поддержки wasaby в tsx синтаксисе
 * @kaizen_zone 02c8f38d-c2cb-404c-b89e-3390ac85a128
 */
import * as React from 'react';
import * as jsx_runtime from 'react/jsx-runtime';
import * as jsx_dev_runtime from 'react/jsx-dev-runtime';
import type { IComponent } from './partial';
import { useElement } from './partial';
import type { IControlOptions } from 'UICommon/Base';
import type { Attr } from 'UICommon/Executor';
import { Logger } from 'UICommon/Utils';
import type { TTemplateEventObject } from 'UICore/Events';
import { reactEventList, wasabyEventIntersection } from 'UICore/Events';
import type { TInternalProps } from 'UICore/Executor';
import { wasabyToReactAttrNames, ReactComponentCreator } from 'UICore/Executor';

function swap(map: object) {
    const ret = {};
    for (const key in map) {
        if (!map.hasOwnProperty(key)) {
            continue;
        }
        ret[map[key]] = key;
    }
    return ret;
}

const WASABY_EVENT_NAMES = swap(wasabyEventIntersection);

function convertEvents(props: IControlOptions): TTemplateEventObject {
    const events = {};
    for (const eventName of reactEventList) {
        if (eventName in props) {
            events[WASABY_EVENT_NAMES[eventName]] = [props[eventName]];
        }
    }

    if (props.customEvents) {
        for (const eventName of props.customEvents) {
            if (eventName.indexOf(':') > -1) {
                Logger.error(
                    'Передано не правильное имя события в customEvents (' +
                        eventName +
                        '), следует использовать camelCase'
                );
                continue;
            }
            if (eventName.search('^on[A-Z]') === 0) {
                if (!props[eventName]) {
                    Logger.warn(
                        'Обработчик события "' +
                            eventName +
                            '" не был найден среди переданных опций'
                    );
                    continue;
                }
                if (typeof props[eventName] !== 'function') {
                    Logger.error('Опция "' + eventName + '" не является обработчиком функции');
                    continue;
                }
                const propNameSuffix = eventName.slice(2);
                const newPropName =
                    'on:' + propNameSuffix[0].toLowerCase() + propNameSuffix.slice(1);
                events[newPropName] = [props[eventName]];
            }
        }
    }
    return events;
}

const dataRegexp = /data(-\w+)+/;
const reactAttrNames = new Set(Object.values(wasabyToReactAttrNames));
/**
 * Приводим атрибуты к васаби-стилю из реактовского
*/
function attributesToWasabyStyle(props: TInternalProps & IControlOptions): Attr.IAttributes {
    const attributes: Attr.IAttributes = props.attrs || {};
    Object.keys(props).forEach((propName: string) => {
        if (reactAttrNames.has(propName) || propName.search(dataRegexp) !== -1) {
            attributes[propName] = props[propName];
        }
        // проп не удаляем. пусть пропы летят вдруг мы ошибочно приняли какой-то проп за атрибут
    });
    return attributes;
}

function ElementCreator({
    type,
    props,
    forwardedRef,
}: {
    type: IComponent;
    props: TInternalProps;
    forwardedRef?: unknown;
}): JSX.Element {
    const clearProps = {
        ...props,
        attrs: undefined,
        context: undefined,
    };
    const events = convertEvents(props);
    const attributes = attributesToWasabyStyle(props);
    const elementForwardedRef = forwardedRef ?? props.forwardedRef ?? props.$wasabyRef;

    if (props.attrs && props.attrs.hasOwnProperty('className')) {
        // Старнный момент, если в атрибутах есть className, то удаляем его из props
        // если не сделать этого, то падают тесты, т.к. уже заложились на такое поведение
        // @ts-ignore
        delete clearProps.className;
    }

    clearProps.forwardedRef = elementForwardedRef;

    return useElement(type, clearProps, attributes, events, props.context);
}

const createElement = React.createElement.bind(React);
generateCreateElement(jsx_dev_runtime, 'jsxDEV');
generateCreateElement(jsx_runtime, 'jsx');
generateCreateElement(React, 'createElement');

function generateCreateElement(originSource: object, originName: string): void {
    const origin = originSource[originName];
    function replaced(type: IComponent, originProps?: IControlOptions, ...rest: []): JSX.Element {
        const props = ReactComponentCreator.convertStringChildren(originProps);
        // UNSAFE_isReact - значит попался wasaby-контрол
        // _$attributes - если есть значит построение верстки было вызвано из генератора, а нам надо из tsx
        // _$createdFromCode - если есть значит построение верстки было вызвано из createControl, а нам надо из tsx
        if (type.UNSAFE_isReact && !props._$attributes && !props._$createdFromCode) {
            return createElement(ElementCreator, { type, props });
        }
        // если вставляется wml-шаблон
        if (type.isDataArray || type.isWasabyTemplate === true || type.isWasabyTemplate === false) {
            return createElement(ElementCreator, { type, props });
        }
        checkType(type);
        const result = origin.apply(this, [type, props, ...rest]);
        return result;
    }
    originSource[originName] = replaced;
}

function checkType(component: IComponent): void {
    if (component instanceof String) {
        Logger.error(
            'Тип элемента неправильный: ожидалась строка или класс/функция, ' +
                'но получили тип ' +
                typeof component +
                '. ' +
                'Скорее всего в качестве элемента был передан объект типа TranslatableString с локализованной строкой'
        );
    }
}
