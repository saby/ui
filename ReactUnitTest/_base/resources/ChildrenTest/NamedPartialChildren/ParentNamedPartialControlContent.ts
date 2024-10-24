import { TemplateFunction } from 'UI/Base';
import ParentNamedPartialContent from './ParentNamedPartialContent';
import * as template from 'wml!ReactUnitTest/_base/resources/ChildrenTest/NamedPartialChildren/ParentNamedPartialControlContent';

export default class ParentNamedPartialControlContent extends ParentNamedPartialContent {
    protected _template: TemplateFunction = template;
}
