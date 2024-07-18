/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
/**
 * Модуль поддержки wasaby в tsx синтаксисе
 */
import * as React from 'react';
import * as jsx_runtime from 'react/jsx-runtime';
import * as jsx_dev_runtime from 'react/jsx-dev-runtime';
import type { IComponent } from './partial';
import type { IControlOptions } from 'UICommon/Base';
import { Logger } from 'UICommon/Utils';
import { ReactComponentCreator } from 'UICore/Executor';
import { constants } from 'Env/Env';
import { ElementCreator } from './ElementCreatorStrategies';

const isServerSide = typeof window === 'undefined';

const createElement = React.createElement.bind(React);
generateCreateElement(jsx_dev_runtime, 'jsxDEV');
generateCreateElement(jsx_runtime, 'jsx');
generateCreateElement(React, 'createElement');

function generateCreateElement(originSource: object, originName: string): void {
    const origin = originSource[originName];
    function replaced(
        type: IComponent,
        originProps?: IControlOptions,
        ...rest: unknown[]
    ): JSX.Element {
        const props = ReactComponentCreator.convertStringChildren(originProps) || {};
        // UNSAFE_isReact - значит попался wasaby-контрол
        // _$attributes - если есть значит построение верстки было вызвано из генератора, а нам надо из tsx
        // _$createdFromCode - если есть значит построение верстки было вызвано из createControl, а нам надо из tsx
        const isWasabyControl =
            type.UNSAFE_isReact && !props._$attributes && !props._$createdFromCode;
        // если вставляется wml-шаблон
        const isWmlTemplate =
            type.isDataArray || type.isWasabyTemplate === true || type.isWasabyTemplate === false;
        if (isWasabyControl || isWmlTemplate) {
            // Следует отдать прикладной ключ в ElementCreator. Он получается верхним компонентом.
            // Если вставлять массив васаби сущностей, реакт будет проверять наличие ключа на ElementCreator.
            if (originName === 'createElement') {
                // Когда используется createElement, ключ лежит в пропсах
                const key = props.key;
                // В опциях самого Васаби он не нужен. Вызывает только ошибку в консоль и размораживание пропсов.
                delete props.key;
                // А третий аргумент может быть children. Может быть и несколько children, но в этой ветке их не поддержать.
                props.children = props.children || rest[0];
                return createElement(ElementCreator, { type, props, key });
            }
            // В случае jsx или jsxdev ключ - это третий аргумент.
            // А дальше - отладочные аргументы jsxdev, тоже лишними не будут.
            return origin.apply(this, [ElementCreator, { type, props }, ...rest]);
        }
        checkType(type);
        checkCustomEventsProp(props);
        const result = origin.apply(this, [type, props, ...rest]);
        return result;
    }
    originSource[originName] = replaced;
}

function checkType(component: IComponent): void {
    if (isServerSide && component instanceof String) {
        Logger.error(
            'Тип элемента неправильный: ожидалась строка или класс/функция, ' +
                'но получили тип ' +
                typeof component +
                '. ' +
                'Скорее всего в качестве элемента был передан объект типа TranslatableString с локализованной строкой'
        );
    }
}

function checkCustomEventsProp(props: IControlOptions): void {
    if (constants.isProduction) {
        return;
    }
    if (!props.customEvents) {
        return;
    }
    for (const propName of props.customEvents) {
        if (!(props[propName] instanceof Function) && typeof props[propName] !== 'undefined') {
            Logger.warn(
                `prop ${propName} должен быть колбэк-функцией (сейчас тип - ${typeof props[
                    propName
                ]}), т.к. все пропы с on* считаются декорируемыми колбэками.`
            );
        }
    }
}
