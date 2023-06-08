import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/Adaptive/Main');
import { create, AdaptiveModeType } from 'UI/Adaptive';

import 'css!Tailwind/tailwind';

class Main extends Control {
    protected _template: TemplateFunction = template;
    adaptiveMode: AdaptiveModeType;

    stopChecking: () => void;

    _beforeMount() {
        const breakpointsUtils = create();

        this.stopChecking = breakpointsUtils.checkBreakpoint((match) => {
            this.adaptiveMode = match;
            // if (match === 'lg') {
            //     // todo временное решение для поддержки текущего апи (isAdaptive)
            //     this.adaptiveMode = undefined;
            // }
        });
    }
    _beforeUnmount() {
        this.stopChecking();
    }
}

export = Main;
