import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!ReactUnitTest/_compatible/resources/WasabyRoot');

// Синхронная загрузка, чтобы замокать асинхронный load.
import 'ReactUnitTest/_compatible/resources/WS3Control';

export default class WasabyRoot extends Control {
    readonly _template: TemplateFunction = template;
}
