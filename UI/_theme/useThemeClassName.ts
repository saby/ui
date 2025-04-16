/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useRef, useLayoutEffect } from 'react';
import { Body as BodyAPI } from 'Application/Page';
import { TClassList } from 'UICommon/theme/controller';
import { useThemeEffect } from './useThemeEffect';

/**
 * Хук, который формирует список классов. Если это верхний враппер, добавляет его на body.
 * @private
 */
export function useThemeClassName(
    classList: TClassList | undefined,
    isUpperScope: boolean
): TClassList {
    const bodyClassListRef = useRef<TClassList>([]);
    useThemeEffect(() => {
        if (isUpperScope) {
            const nextClassList = classList ? [...classList] : [];
            BodyAPI.getInstance().replaceClasses(bodyClassListRef.current, nextClassList);
            bodyClassListRef.current = nextClassList;
        }
    }, [classList]);
    
    useLayoutEffect(() => {
        return () => BodyAPI.getInstance().replaceClasses(bodyClassListRef.current, []);
    }, []);
    
    if (!isUpperScope && classList && classList?.length > 0) {
        return classList;
    }
    
    return [];
}
