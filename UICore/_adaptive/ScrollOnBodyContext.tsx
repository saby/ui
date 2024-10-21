/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import * as React from 'react';

interface IScrollOnBodyContextValue {
    isScrollOnBody: boolean;
}
export type TScrollOnBodyContext = React.Context<IScrollOnBodyContextValue>;

/**
 * Контекст передает значение isScrollOnBody - индикатор включения/выключения скролла на body для мобильных устройств
 */
const ScrollOnBodyContext: TScrollOnBodyContext = React.createContext(undefined);
export { ScrollOnBodyContext };
