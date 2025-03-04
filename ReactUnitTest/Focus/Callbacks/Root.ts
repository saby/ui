import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/Focus/Callbacks/Root';

export default class Root extends Control {
    _template: TemplateFunction = template;

    // Колбеки хока первого инпута
    firstHOCActivatedCallback(): void {
        return;
    }
    firstHOCDeactivatedCallback(): void {
        return;
    }

    // Колбеки первого инпута
    firstInputActivatedCallback(): void {
        return;
    }
    firstInputDeactivatedCallback(): void {
        return;
    }

    // Колбеки хока второго инпута
    secondHOCActivatedCallback(): void {
        return;
    }
    secondHOCDeactivatedCallback(): void {
        return;
    }

    // Колбеки второго инпута
    secondInputActivatedCallback(): void {
        return;
    }
    secondInputDeactivatedCallback(): void {
        return;
    }

    // Колбеки общего для обоих интупов хока
    commonHOCActivatedCallback(): void {
        return;
    }
    commonHOCDeactivatedCallback(): void {
        return;
    }
}
