import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/WasabyUpdater/SyncChild';

export default class SyncChild extends Control<IControlOptions> {
    _template: TemplateFunction = template;
}
