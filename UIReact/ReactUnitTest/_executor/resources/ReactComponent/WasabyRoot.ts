import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/ReactComponent/WasabyRoot';

interface IWasabyRootOptions extends IControlOptions {
    reactFunction?: boolean;
    reactComponent?: boolean;
    extendedReactComponent?: boolean;
    memoizedReactComponent?: boolean;
    reactPureComponent?: boolean;
    wasabyControl?: boolean;
    wasabyControlContent?: boolean;
    withForwardRef?: boolean;
}
export default class WasabyRoot extends Control<IWasabyRootOptions> {
    _template: TemplateFunction = template;

    // Для проверки, правильно ли пролетает forwardedRef через генератор.
    // В классовом компоненте он должен остаться forwardedRef, в forwardRef - преобразоваться в ref.
    htmlElementRef(element?: HTMLElement): void {
        element.className = 'patchedFromForwardedRef';
    }
}
