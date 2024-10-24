import { useRef, useMemo, useEffect } from 'react';
import { Body as BodyAPI } from 'Application/Page';
import { TClassList } from 'UICommon/theme/controller';
import { useThemeEffect } from './useThemeEffect';

/**
 * Хук, который формирует имя класса. Если это верхний враппер, добавляет его на body.
 * @private
 */
export function useThemeClassName(
    classList: TClassList | undefined,
    isUpperScope: boolean,
    childrenClassName?: string
): string {
    const bodyClassListRef = useRef<TClassList>([]);
    useThemeEffect(() => {
        if (isUpperScope) {
            const nextClassList = classList ? [...classList] : [];
            BodyAPI.getInstance().replaceClasses(bodyClassListRef.current, nextClassList);
            bodyClassListRef.current = nextClassList;
        }
    }, [classList]);
    useEffect(() => {
        return () => BodyAPI.getInstance().replaceClasses(bodyClassListRef.current, []);
    }, []);
    const themeClassName: string = useMemo(() => {
        const currentClassName = [];
        if (childrenClassName) {
            currentClassName.push(childrenClassName);
        }

        if (!isUpperScope && classList && classList?.length > 0) {
            currentClassName.push(classList.join(' '));
        }

        return currentClassName.join(' ');
    }, [classList, childrenClassName, isUpperScope]);
    return themeClassName;
}
