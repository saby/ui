import { Control } from 'UICore/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/Control');

export default class MyControl extends Control {
    protected _template = template;
}
