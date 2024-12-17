import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/WasabyUpdater/WasabyUpdaterRoot';

export default class WasabyUpdaterRoot extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    _showAsync: boolean = false;
    _showSync: boolean = false;

    toggleAsync(): void {
        this._showSync = false;
        this._showAsync = !this._showAsync;
    }

    showSync(): void {
        this._showSync = true;
    }
}
