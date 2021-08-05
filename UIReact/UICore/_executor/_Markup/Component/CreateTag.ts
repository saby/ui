import {
    Attr,
    IAttributes,
    IGeneratorComponent,
    TAttributes,
    TObject,
    VoidTags as voidElements
} from 'UICommon/Executor';

import {joinElements} from '../Utils';


export class CreateTag implements IGeneratorComponent {
    create(
        tagName: string,
        attrs: TObject,
        children: string[],
        attrToDecorate: TObject,
        __: unknown
    ): string {
        if (!attrToDecorate) {
            attrToDecorate = {};
        }
        if (!attrs) {
            attrs = {attributes: {}};
        }

        const mergedAttrs = Attr.processMergeAttributes(
            attrToDecorate.attributes as IAttributes,
            attrs.attributes as IAttributes
        );

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
        if (~voidElements.indexOf(tagName)) {
            return '<' + tagName + mergedAttrsStr + ' />';
        }
        return '<' + tagName + mergedAttrsStr + '>' + joinElements(children) + '</' + tagName + '>';
    }

    private decorateAttrs(attr1: TAttributes, attr2: TAttributes): string {
        function wrapUndef(value: string): string {
            if (value === undefined || value === null) {
                return '';
            } else {
                return value;
            }
        }

        const attrToStr = (attrs: string[]): string => {
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
