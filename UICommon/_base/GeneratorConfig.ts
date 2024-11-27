/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGeneratorConfig } from 'UICommon/Executor';
import { _FocusAttrs } from 'UICommon/Focus';
import { isNewEnvironment } from 'UICommon/Utils';

export function prepareAttrsForPartial(attributes: any): void {
    return _FocusAttrs.prepareAttrsForFocus(attributes.attributes);
}

function prepareAttrsForRoot(attributes: any, options: any): void {
    if (isNewEnvironment()) {
        // заполняем только для старых страниц
        return;
    }
    // временное решение до тех пор пока опция темы не перестанет быть наследуемой
    // добавлено тут https://online.sbis.ru/opendoc.html?guid=5a70cc3b-0d05-4071-8ba3-3dd6cd1ba0bd
    attributes.attributes.class = attributes.attributes.class || '';
    if (typeof options.theme === 'string') {
        const themeName = 'controls_theme-' + options.theme;
        if (attributes.attributes.class.indexOf(themeName) === -1) {
            attributes.attributes.class =
                attributes.attributes.class + ' ' + themeName;
        }
    }
}

const _generatorConfig = {
    prepareAttrsForPartial,
    prepareAttrsForRoot,
};

export function getGeneratorConfig(): IGeneratorConfig {
    return _generatorConfig;
}
