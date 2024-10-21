import { Logger } from 'UICommon/Utils';
import { render } from 'react-dom';
import { ReactElement } from 'react';

const REACT_DOM_SERVER = 'react-dom/server';

export default function (reactElement: ReactElement) {
    if (requirejs.defined(REACT_DOM_SERVER)) {
        return requirejs(REACT_DOM_SERVER).renderToString(reactElement);
    }
    if (typeof window === 'undefined') {
        Logger.error('react-dom/server не загружен');
        return '';
    }
    requirejs([REACT_DOM_SERVER]);
    const div = document.createElement('div');
    div.style.display = 'none';
    document.body.appendChild(div);
    render(reactElement, div);
    const html = div.innerHTML;
    document.body.removeChild(div);
    return html;
}
