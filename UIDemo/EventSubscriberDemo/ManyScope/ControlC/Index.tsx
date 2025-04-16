import { useRef } from 'react';

import { default as Notifier } from './Notifier';
import { default as NotifierDeep } from './NotifierDeep';

export default function Index() {
    const rootRef = useRef(null);

    return (
        <div ref={rootRef}>
            <h2>Это Control C</h2>
            <Notifier />
            <NotifierDeep />
        </div>
    );
}
