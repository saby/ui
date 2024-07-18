/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
import * as React from 'react';
import { Logger, ArrayUtils } from 'UICommon/Utils';
import { CommonUtils as Common, Scope } from 'UICommon/Executor';
import type {
    IGenerator,
    IGeneratorAttrs,
    IGeneratorComponent,
    IGeneratorConfig,
} from 'UICommon/Executor';
import { IWasabyAttributes } from '../Attributes';
import { TEventObject } from 'UICommon/Events';

import type { Control } from 'UICore/Base';
import { IControlOptions } from 'UICommon/Base';
import type { TemplateOrigin, IControlConfig, AttrToDecorate } from '../interfaces';
import { Generator, calcOriginEventName } from '../Generator';

import { ChainOfRef, CreateOriginRef, IResponsibilityHandler } from 'UICore/Ref';
import { constants } from 'Env/Env';

import { CreateTagVdom } from '../Component';

const isServerSide = typeof window === 'undefined';
const CUSTROMEVENTS_WHITELIST = ['onCaption'];

export class GeneratorVdom extends Generator implements IGenerator {
    private createTagComponent: IGeneratorComponent;

    constructor(config: IGeneratorConfig) {
        super(config);
        this.createTagComponent = new CreateTagVdom();
    }

    /**
     * подготавливает опции для контрола. вызывается в функции шаблона в случае выполнения инлайн шаблона
     * @param tplOrigin тип шаблона
     * @param scope результирующий контекст выполнения
     */
    prepareDataForCreate(
        tplOrigin: TemplateOrigin,
        scope: IControlOptions,
        attrs: IGeneratorAttrs
    ): IControlOptions {
        // scope может прийти после обработки метода uniteScope в шаблоне - это функция reshaper
        // которую надо выполнить чтобы получить результирующий scope
        const controlProperties = Scope.calculateScope(scope, Common.plainMerge) || {};
        if (tplOrigin === '_$inline_template') {
            if (this.config && this.config.prepareAttrsForPartial) {
                this.config.prepareAttrsForPartial(attrs);
            }
            attrs.events = calcOriginEventName(attrs.events);
            // в случае ws:template отдаем текущие свойства
            return controlProperties;
        }
        return undefined;
    }

    createDirective(text: any): any {
        try {
            throw new Error('vdomMarkupGenerator createDirective not realized');
        } catch (e) {
            Logger.error('createDirective  ... in VDom', text, e);
        }
    }

    protected calculateOptions(
        options: IControlOptions & { ref: React.RefCallback<Control> },
        config: IControlConfig,
        events: TEventObject,
        name: string,
        originRef: string | React.MutableRefObject<Control> | React.RefCallback<Control>
    ): IControlOptions & { ref: IResponsibilityHandler } {
        let ref;
        if (!isServerSide) {
            const chainOfRef = new ChainOfRef();
            if (name && config.viewController && config.viewController.childrenRefsCreator) {
                const childrenRef =
                    config.viewController.childrenRefsCreator.getRef(name) ??
                    config.viewController.childrenRefsCreator.createRef(name);
                chainOfRef.add(childrenRef);
            }
            if (originRef) {
                chainOfRef.add(new CreateOriginRef(originRef));
            }
            if (!chainOfRef.isEmpty()) {
                ref = chainOfRef.execute();
            }
        }

        const _logicParent = config.viewController;
        // _physicParent используется, если строится шаблон, прокинули родителя сверху
        const _physicParent = config.attr?._physicParent || _logicParent;
        // при вставке шаблона в partial через if, тип заранее неизвестен и надо унаследовать опции readOnly и theme
        this.calculateInheritOptions(options, config);
        if (!isServerSide) {
            options._$events = events;
            options.ref = ref;
        }
        // для goUpByControlTree
        options._physicParent = _physicParent;
        // множество использований логического родителя
        options._logicParent = _logicParent;
        // инициализируем _registerAsyncChild из непосредственного логического родителя, из контрола
        // отправим промис ожидания завершения загрузки контрола, если понадобится. В ожидание входит:
        // промис beforeMount, загрузка стилей, ожидание загрузки дочерних контролов
        // @ts-ignore
        options._registerAsyncChild = _physicParent?._registerAsyncChild;
        options._$blockOptionNames = config.blockOptionNames;

        if (constants.isProduction) {
            // @ts-ignore
            return options;
        }
        for (const optionName of Object.keys(options)) {
            const re = /^on[A-Z][A-Za-z]+/g;
            if (
                re.test(optionName) &&
                !(options[optionName] instanceof Function) &&
                typeof options[optionName] !== 'undefined' &&
                CUSTROMEVENTS_WHITELIST.indexOf(optionName) === -1
            ) {
                Logger.warn(
                    `Опция ${optionName} должен быть колбэк-функцией (сейчас тип - ${typeof options[
                        optionName
                    ]}).
                    Следует переименовать опцию, т.к. подобные опции будут вызывать сложности при портировании контрола на реакт.`
                );
            }
        }
        // @ts-ignore
        return options;
    }

    private calculateInheritOptions(
        options: IControlOptions & { ref: React.RefCallback<Control> },
        config: IControlConfig
    ): IControlOptions & { ref: React.RefCallback<Control> } {
        // надо искать readOnly и theme сначала в наследуемых опциях, затем в опция (могли задать атрибутом на контроле)
        // если не нашли то берем значение по-умолчанию readOnly = false и theme = 'default' (логика inferno)
        if (typeof options.readOnly === 'undefined') {
            options.readOnly = config.data.readOnly || config.data.props?.readOnly || false;
        }
        if (typeof options.theme === 'undefined') {
            options.theme = config.data.theme || config.data.props?.theme || 'default';
        }
        if (typeof options.pageData === 'undefined') {
            options.pageData = config.data.pageData || config.data.props?.pageData || null;
        }
        if (typeof options.Router === 'undefined') {
            options.Router = config.data.Router || config.data.props?.Router || null;
        }
        if (typeof options.isAdaptive === 'undefined') {
            options.isAdaptive =
                config.data.isAdaptive ?? config.data.props?.isAdaptive ?? undefined;
        }
        return options;
    }
    /*
    FIXME: не понимаю зачем нужен этот метод, по сути он ничего не делает.
    Вроде шаблонизатор не может сгенерировать вызов этого метода с чем-то отличным от строки.
     */
    createText(text: string): string {
        if (typeof text !== 'string') {
            /*
            FIXME: я считаю, что эта функция всегда зовётся со строкой и проверка бесполезна.
            Но т.к. она тут была, то удалять её немножко страшно, вдруг там реально были не вызовы не со строками.
            Ведь для реакта null и undefined это валидные ноды, но странно, если для них звался бы createText.
             */
            Logger.error(
                'Тут должна была прийти строка, нужно подняться по стеку и понять откуда здесь что-то другое'
            );
            return '';
        }
        return text;
    }

    /**
     * Дает возможность дополнительно трансформировать результат построения контрола.
     * @param control Результат построения контрола.
     */
    processControl(
        control: React.ComponentElement<IControlOptions, Control<IControlOptions, object>>
    ): React.ComponentElement<IControlOptions, Control<IControlOptions, object>> {
        return control;
    }

    /*
    FIXME: Изначально в joinElements было return ArrayUtils.flatten(elements, true).
    Он зовётся из каждого шаблона, так что нельзя просто взять и удалить.
    Вроде он нужен для тех случаев, когда partial вернёт вложенный массив. Я пытался возвращать
    несколько корневых нод из partial, возвращался просто массив из двух элементов.
    Так что пока этот метод ничего не делает.
     */
    joinElements(elements: string[] | React.ReactNode): string | React.ReactNode {
        if (Array.isArray(elements)) {
            return ArrayUtils.flatten(elements, true, true);
        }

        throw new Error('joinElements: elements is not array');
    }

    /**
     * Строит DOM-элемент.
     * @param tagName Название DOM-элемента.
     * @param attrs Атрибуты DOM-элемента.
     * @param children Дети DOM-элемента.
     * @param attrToDecorate атрибуты элемента.
     * @param __
     * @param control Инстанс контрола-родителя, используется для заполнения _children.
     */
    createTag<T extends HTMLElement, P extends React.HTMLAttributes<T>>(
        tagName: keyof React.ReactHTML,
        attrs: {
            attributes: P & IWasabyAttributes;
            events: TEventObject;
        },
        children: React.ReactNode[],
        attrToDecorate: AttrToDecorate,
        __: unknown,
        control?: Control,
        isContainerNode?: boolean
    ): React.DetailedReactHTMLElement<P, T> {
        return this.createTagComponent.create(
            tagName,
            attrs,
            children,
            attrToDecorate,
            __,
            control,
            isContainerNode
        );
    }

    // FIXME: бесполезный метод, но он зовётся из шаблонов
    escape<T>(value: T): T {
        return value;
    }
}
