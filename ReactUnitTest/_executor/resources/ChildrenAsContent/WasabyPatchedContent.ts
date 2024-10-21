import { Control } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ChildrenAsContent/WasabyPatchedContent');

export default class WasabyPatchedContent extends Control {
    protected _template = template;
}
