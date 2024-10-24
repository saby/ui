import { useAdaptiveMode } from 'UICore/Adaptive';

export default function AdaptiveAspectsValue(): JSX.Element {
    const adaptiveMode = useAdaptiveMode();
    return (
        <div>
            {typeof adaptiveMode.container.clientWidth.value !== 'undefined' && (
                <span>container clientWidth: {'' + adaptiveMode.container.clientWidth.value}</span>
            )}
            {typeof adaptiveMode.container.clientHeight.value !== 'undefined' && (
                <span>
                    container clientHeight: {'' + adaptiveMode.container.clientHeight.value}
                </span>
            )}
            {typeof adaptiveMode.window.innerWidth.value !== 'undefined' && (
                <span>window innerWidth: {'' + adaptiveMode.window.innerWidth.value}</span>
            )}
            {typeof adaptiveMode.window.innerHeight.value !== 'undefined' && (
                <span>window innerHeight: {'' + adaptiveMode.window.innerHeight.value}</span>
            )}
            {typeof adaptiveMode.window.outerWidth.value !== 'undefined' && (
                <span>window outerWidth: {'' + adaptiveMode.window.outerWidth.value}</span>
            )}
            {typeof adaptiveMode.window.outerHeight.value !== 'undefined' && (
                <span>window outerHeight: {'' + adaptiveMode.window.outerHeight.value}</span>
            )}
            {typeof adaptiveMode.window.viewportWidth.value !== 'undefined' && (
                <span>window viewportWidth: {'' + adaptiveMode.window.viewportWidth.value}</span>
            )}
            {typeof adaptiveMode.window.viewportHeight.value !== 'undefined' && (
                <span>window viewportHeight: {'' + adaptiveMode.window.viewportHeight.value}</span>
            )}
            {typeof adaptiveMode.window.screenWidth.value !== 'undefined' && (
                <span>window screenWidth: {'' + adaptiveMode.window.screenWidth.value}</span>
            )}
            {typeof adaptiveMode.window.screenHeight.value !== 'undefined' && (
                <span>window screenHeight: {'' + adaptiveMode.window.screenHeight.value}</span>
            )}
            {typeof adaptiveMode.device.isPhone() !== 'undefined' && (
                <span>device isPhone: {'' + adaptiveMode.device.isPhone()}</span>
            )}
            {typeof adaptiveMode.device.isTablet() !== 'undefined' && (
                <span>device isTablet: {'' + adaptiveMode.device.isTablet()}</span>
            )}
            {typeof adaptiveMode.device.isTouch() !== 'undefined' && (
                <span>device isTouch: {'' + adaptiveMode.device.isTouch()}</span>
            )}
            {typeof adaptiveMode.orientation.isVertical() !== 'undefined' && (
                <span>orientation isVertical: {'' + adaptiveMode.orientation.isVertical()}</span>
            )}
            {typeof adaptiveMode.orientation.isHorizontal() !== 'undefined' && (
                <span>
                    orientation isHorizontal: {'' + adaptiveMode.orientation.isHorizontal()}
                </span>
            )}
        </div>
    );
}
