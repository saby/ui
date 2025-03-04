import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { addPrintHandlers, removePrintHandlers } from './PrintDialogController';

export default function PrintDialog({ children }: { children: ReactNode }): JSX.Element {
    useEffect(() => {
        addPrintHandlers();
        return () => {
            removePrintHandlers();
        };
    }, []);

    return children as JSX.Element;
}
