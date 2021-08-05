import * as React from "react";
import { convertAttributes, WasabyAttributes } from '../Attributes';
import { IWasabyEvent } from 'UICommon/Events';
import { AttrToDecorate } from '../interfaces';
import { ArrayUtils } from 'UICommon/Utils';
import { Attr } from 'UICommon/Executor';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
import { CreateEventRef } from '../Refs/CreateEventRef';
import { CreateChildrenRef } from '../Refs/CreateChildrenRef';
import type { Control } from 'UICore/Base';

import { IGeneratorComponent } from './IGeneratorComponent';

export class CreateTagVdom implements IGeneratorComponent {
    create<T extends HTMLElement, P extends React.HTMLAttributes<T>>(
        tagName: keyof React.ReactHTML,
        attrs: {
            attributes: P & WasabyAttributes;
            events: Record<string, IWasabyEvent[]>
        },
        children: React.ReactNode[] & {
            for: boolean
        },
        attrToDecorate: AttrToDecorate,
        __: unknown,
        control?: Control
    ): React.DetailedReactHTMLElement<P, T> {
        if (!attrToDecorate) {
            attrToDecorate = {attributes: {}, events: {}};
        }
        /* если события объявляется на контроле, и корневом элементе шаблона, то мы должны смержить события,
         * без этого события объявленные на контроле будут потеряны
         */
        const eventsObject = {
            events: Attr.mergeEvents(attrToDecorate.events, attrs.events) || {}
        };
        /**
         * Объединяет атрибуты, указанные на элементе, с атрибутами, которые пришли сверху
         */
        const mergedAttrs = Attr.mergeAttrs(attrToDecorate.attributes, attrs.attributes);
        Object.keys(mergedAttrs).forEach((attrName) => {
            if (!mergedAttrs[attrName]) {
                delete mergedAttrs[attrName];
            }
        });
        const name = mergedAttrs.name;
        const originRef = attrs.attributes.ref;
        const chainOfRef = new ChainOfRef();
        const createChildrenRef = new CreateChildrenRef(control, name);
        const createEventRef = new CreateEventRef(tagName, eventsObject);
        chainOfRef.add(createChildrenRef);
        chainOfRef.add(createEventRef);
        if (originRef) {
            chainOfRef.add(new CreateOriginRef(originRef));
        }

        const convertedAttributes = convertAttributes(mergedAttrs);

        /* не добавляем extractedEvents в новые пропсы на теге, т.к. реакт будет выводить ошибку о неизвестном свойстве
            https://online.sbis.ru/opendoc.html?guid=d90ec578-f610-4d93-acdd-656095591bc1
        */
        const newProps = {
            ...convertedAttributes,
            ref: chainOfRef.execute()
        };

        // Разворачиваем массив с детьми, так как в противном случае react считает, что мы отрисовываем список
        const flatChildren = ArrayUtils.flatten(children, true);
        if (flatChildren.for) {
            // если дети получены циклом - нужно вставлять их массивом, чтобы учитывались ключи
            return React.createElement<P, T>(tagName, newProps, flatChildren);
        }
        return React.createElement<P, T>(tagName, newProps, ...flatChildren);
    }
}
