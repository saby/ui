import { Control } from 'UICore/Base';
import * as template from 'wml!ReactUnitTest/Focus/RestoreFocus/RootWithReactOpener';

export default class RootWithReactOpener extends Control {
    protected _template = template;
    protected showRestoreFocusRoot = false;
    _afterMount(): void {
        // чтобы гарантированно ReactOpener был замаунченным опенером, покажем его на _afterMount.
        this.showRestoreFocusRoot = true;
    }
}
