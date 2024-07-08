/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { createElement } from 'react';
import * as React from 'react';
import { getResourceUrl, isDebug } from 'UICommon/Utils';

export const ASYNC_LOADING_TEST_INDICATOR = '$$wasaby$async$loading';

/**
 * @public
 * По умолчанию вставляем пустой div вместо компонента в момент загрузки асинхронного beforeMount
 * В дебаге вставляем "ромашку"
 */
export function getLoadingComponent(ref: React.RefCallback<unknown>): React.ReactElement {
    if (isDebug()) {
        return createElement('img', {
            src: getResourceUrl('/cdn/LoaderIndicator/1.0.0/ajax-loader-indicator.gif', true),
            style: { maxWidth: '32px', maxHeight: '32px' },
            name: ASYNC_LOADING_TEST_INDICATOR,
            ref,
        });
    }
    return createElement('div', { name: ASYNC_LOADING_TEST_INDICATOR, ref });
}
