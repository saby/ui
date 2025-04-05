import { useContext } from 'react';
import { BackgroundContext } from './BackgroundViewer';

export const useThemeScheme = (): boolean => {
    const backgroundContext = useContext(BackgroundContext);
    if (!backgroundContext) {
        return true;
    }
    return backgroundContext.isLigthTheme ?? true;
};
