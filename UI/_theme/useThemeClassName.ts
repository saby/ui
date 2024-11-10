import { useRef, MutableRefObject, useMemo } from 'react';
import { Body as BodyAPI } from 'Application/Page';
import { TClassList } from 'UICommon/theme/controller';

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
    if (isUpperScope) {
        updateClassList(bodyClassListRef, classList);
    }
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

function updateClassList(
    classListRef: MutableRefObject<TClassList>,
    nextClassList: Promise<TClassList | void> | TClassList | void
): void {
    if (!nextClassList) {
        return;
    }
    if (Array.isArray(nextClassList)) {
        BodyAPI.getInstance().replaceClasses(classListRef.current, nextClassList);
        classListRef.current = [...nextClassList];
        return;
    }
    nextClassList.then((asyncNextClassList) => {
        updateClassList(classListRef, asyncNextClassList);
    });
}
