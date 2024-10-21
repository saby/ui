import { TemplateFunction } from 'UI/Base';
import ParentNamedPartialContent from './ParentNamedPartialContent';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/NamedPartialChildren/ParentNamedPartialHTMLElementContent';

export default class ParentNamedPartialHTMLElementContent extends ParentNamedPartialContent {
    protected _template: TemplateFunction = template;
}
