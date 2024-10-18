/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { TFocusComponent } from './IFocusComponent';

// Пока затачиваемся на Wasaby API + возможную совместимость, костыляем ts.
interface IPatchedFocusComponent {
    _container: HTMLElement | [HTMLElement];
}

export default function getFocusComponentContainer(
    focusComponent: TFocusComponent
): HTMLElement {
    const container = (focusComponent as unknown as IPatchedFocusComponent)
        ._container;
    if ('length' in container) {
        return container[0];
    }
    return container;
}
