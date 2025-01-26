import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/WasabyUpdater/SyncWrapper';

export default class SyncWrapper extends Control<IControlOptions> {
    _template: TemplateFunction = template;
}
