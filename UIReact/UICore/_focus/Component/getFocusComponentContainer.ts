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
