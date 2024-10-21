/**
 * @kaizen_zone ab3bb41a-875b-4344-9c09-6bc14c5a22f0
 */
import {
    Attr,
    IGeneratorComponent,
    TAttributes,
    TObject,
    VoidTags as voidElements,
} from 'UICommon/Executor';
import { _FocusAttrs } from 'UICommon/Focus';
import { reactAttrsToWasabyDom } from '../Attributes';
import { joinElements } from '../Utils';

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
            attrs = { attributes: {} };
        }

        // здесь могут прийти аттрибуты в camelCase, т.к. в GeneratorCompatibleReactVdom на СП тэги строятся через
        // текстовый createTag. А всё что выше через Vdom/Generator, который все аттрибуте переделал в camelCase
        // Поэтому необходимо аттрибуты превратить из camelCase в HTML-аттрибуты - вызов reactAttrsToWasabyDom(...)
        const mergedAttrs = Attr.processMergeAttributes(
            reactAttrsToWasabyDom(attrToDecorate.attributes),
            reactAttrsToWasabyDom(attrs.attributes)
        );

        for (const attrName of Object.keys(mergedAttrs)) {
            if (attrName.indexOf('top:') === 0) {
                const newAttrName = attrName.replace('top:', '');
                mergedAttrs[newAttrName] = mergedAttrs[newAttrName] || mergedAttrs[attrName];
                delete mergedAttrs[attrName];
            }
        }

        const focusAreaProps = _FocusAttrs.extractAttributesForFocusArea(mergedAttrs);

        mergedAttrs.tabindex = focusAreaProps.tabIndex;
        mergedAttrs['ws-autofocus'] = focusAreaProps.autofocus;

        const mergedAttrsStr = this.decorateAttrs(mergedAttrs);
        // eslint-disable-next-line no-bitwise
        if (~voidElements.indexOf(tagName)) {
            return '<' + tagName + mergedAttrsStr + ' />';
        }
        return '<' + tagName + mergedAttrsStr + '>' + joinElements(children) + '</' + tagName + '>';
    }

    private decorateAttrs(attrs: TAttributes): string {
        let str = '';
        for (const attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                if (attrs[attr] !== undefined && attrs[attr] !== null && attrs[attr] !== '') {
                    str += ` ${attr}="${attrs[attr]}"`;
                }
            }
        }
        return str;
    }
}
