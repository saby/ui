define('ReactUnitTest/Focus/RestoreFocus/WsControl', [
    'Lib/Control/CompoundControl/CompoundControl',
    'wml!ReactUnitTest/Focus/RestoreFocus/WsControl',
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
