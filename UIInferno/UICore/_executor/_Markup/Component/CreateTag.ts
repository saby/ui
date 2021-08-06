import {
    Attr,
    GeneratorStringArray,
    IBaseAttrs,
    CommonUtils as Common,
    invisibleNodeTagName,
    VoidTags as voidElements,
    IGeneratorDefCollection,
    TAttributes,
    IAttributes,
    IGeneratorComponent
} from 'UICommon/Executor';
import { cutFocusAttributes, joinElements, invisibleNodeHTML } from '../Utils';
import { _FocusAttrs } from 'UICore/Focus';

export class CreateTag implements IGeneratorComponent {
    create(
        tag: string,
        attrs: IBaseAttrs | {attributes: unknown},
        children: GeneratorStringArray,
        attrToDecorate?: TAttributes,
        defCollection?: IGeneratorDefCollection
    ): string {
        if (tag === invisibleNodeTagName) {
            return invisibleNodeHTML;
        }

        if (!attrToDecorate) {
            attrToDecorate = {};
        }
        if (!attrs) {
            attrs = {attributes: {}};
        }

        let mergedAttrs = Attr.processMergeAttributes(
            attrToDecorate.attributes as IAttributes,
            attrs.attributes as IAttributes
        );

        _FocusAttrs.prepareTabindex(mergedAttrs);
        // remove focus attributes from object
        if (Common.isCompat()) {
            // ! не вырезаем фокусные атрибуты, для совместимости. чтобы старые компоненты могли работать в новом окружении
            // textMarkupGenerator.cutFocusAttributes(mergedAttrs);
        } else {
            cutFocusAttributes(mergedAttrs);
        }

        Object.keys(mergedAttrs).forEach((attrName) => {
            if (attrName.indexOf('top:') === 0) {
                const newAttrName = attrName.replace('top:', '');
                mergedAttrs[newAttrName] = mergedAttrs[newAttrName] || mergedAttrs[attrName];
                delete mergedAttrs[attrName];
            }
        });
        const mergedAttrsStr = mergedAttrs
            ? this.decorateAttrs(mergedAttrs, {})
            : '';
        // tslint:disable-next-line:no-bitwise
        if (~voidElements.indexOf(tag)) {
            return '<' + tag + mergedAttrsStr + ' />';
        }
        return '<' + tag + mergedAttrsStr + '>' + joinElements(children, undefined, defCollection) + '</' + tag + '>';
    }

    /**
     *
     * @param attr1
     * @param attr2
     * @returns {string}
     */
    private decorateAttrs(attr1: TAttributes, attr2: TAttributes): string {
        function wrapUndef(value: string): string {
            if (value === undefined || value === null) {
                return '';
            } else {
                return value;
            }
        }

        const attrToStr = (attrs: Array<string>): string => {
            let str = '';
            for (const attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    str += (wrapUndef(attrs[attr]) !== '' ? ' ' + (attr + '="' + attrs[attr] + '"') : '');
                }
            }
            return str;
        };
        return attrToStr(Attr.joinAttrs(attr1, attr2));
    }
}
