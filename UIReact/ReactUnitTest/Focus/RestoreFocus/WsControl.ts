define('ReactUnitTest/Focus/RestoreFocus/WsControl', [
    'Lib/Control/CompoundControl/CompoundControl',
    'wml!ReactUnitTest/Focus/RestoreFocus/WsControl',
    'Lib/Control/Control.compatible',
    'Lib/Control/AreaAbstract/AreaAbstract.compatible',
    'Lib/Control/CompoundControl/CompoundControl',
    'Lib/Control/BaseCompatible/BaseCompatible',
    'Core/helpers/Hcontrol/makeInstanceCompatible',
    'Lib/StickyHeader/StickyHeaderMediator/StickyHeaderMediator',
    'View/ExecutorCompatible',
    'Core/nativeExtensions',
    'css!SBIS3.CONTROLS/themes/online/onlineCompatible',
], (Control, dotTplFn) => {
    'use strict';

    const CompoundChild = Control.extend({
        $protected: {
            _options: {},
        },
        _dotTplFn: dotTplFn,
    });

    return CompoundChild;
});
