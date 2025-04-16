import { useContext } from 'react';
import { BackgroundContext } from './_backgroundViewer/Context';

export const useThemeScheme = (): boolean => {
    const backgroundContext = useContext(BackgroundContext);
    if (!backgroundContext) {
        return true;
    }
    return backgroundContext.isLigthTheme ?? true;
};
