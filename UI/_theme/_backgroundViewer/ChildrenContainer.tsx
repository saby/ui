/* eslint-disable @typescript-eslint/no-magic-numbers */
/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import type { Ref, CSSProperties, ReactNode } from 'react';
import { forwardRef, cloneElement } from 'react';
import type { IBackground } from '../background/IBackground';
import type { TClassList } from 'UICommon/theme/controller';
import { isReactElement } from 'UICore/Executor';
import { BackgroundContext } from './Context';

interface IBackgroundViewerChildrenContainer {
    classList: TClassList;
    backgroundContextValue: IBackground;
    children?: ReactNode;
    onClick?: () => void;
    backgroundStyles?: CSSProperties;
    backgroundStylesClassName?: string;
}

export default forwardRef(function ChildrenContainer(
    props: IBackgroundViewerChildrenContainer,
    ref: Ref<HTMLDivElement>
) {
    if (!isReactElement(props.children)) {
        return null;
    }

    const _backgroundStyles = props.backgroundStyles;
    const _backgroundStylesClassName = props.backgroundStylesClassName;

    if (_backgroundStyles) {
        delete _backgroundStyles.left;
        delete _backgroundStyles.top;
        delete _backgroundStyles.zIndex;
    }

    let childrenContainerClassList = [];
    const childrenClassName = props.children.props.className ?? '';
    if (childrenClassName.length > 0) {
        childrenContainerClassList.push(childrenClassName);
    }
    childrenContainerClassList = childrenContainerClassList.concat(props.classList);

    // Лучше добавлять children только те пропсы, которые действительно есть.
    // Например, onClick со значением undefined приводит к ошибке в консоль.
    const newChildrenProps: Record<string, unknown> = {
        className: childrenContainerClassList.join(' '),
    };

    if (ref) {
        newChildrenProps.ref = ref;
    }
    if (props.onClick) {
        newChildrenProps.onClick = props.onClick;
    }
    if (_backgroundStyles && !_backgroundStylesClassName) {
        newChildrenProps.style = _backgroundStyles;
    }
    if (_backgroundStylesClassName) {
        newChildrenProps.className = newChildrenProps.className + ' ' + _backgroundStylesClassName;
    }

    return (
        <BackgroundContext.Provider value={props.backgroundContextValue}>
            {cloneElement(props.children, newChildrenProps)}
        </BackgroundContext.Provider>
    );
});
