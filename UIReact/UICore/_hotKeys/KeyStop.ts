/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { Control, IControlOptions, TemplateFunction } from 'UICore/Base';

// @ts-ignore
import * as template from 'wml!UICore/_hotKeys/KeyStop';

import { SyntheticEvent } from 'UICommon/Events';

interface IKeyStopItem {
    keyCode: number;
}

interface IKeyStopOptions extends IControlOptions {
    stopKeys: IKeyStopItem[];
}

/**
 * Контрол, который позволяет предотвращать всплытие событий нажатий на клавиши
 * @class UICore/_hotKeys/KeyStop
 * @extends UICore/Base:Control
 * @public
 */
export default class KeyStop extends Control<IKeyStopOptions> {
    protected _template: TemplateFunction = template;

    // @ts-ignore
    protected _keydownHandler(event: SyntheticEvent<KeyboardEvent>): void {
        const keys = this._options.stopKeys || [];

        if (
            keys.find((key) => {
                return key.keyCode === event.nativeEvent.keyCode;
            })
        ) {
            // @ts-ignore
            event.stopped = true;
        }
    }
}
