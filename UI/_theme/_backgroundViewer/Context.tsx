import { createContext } from 'react';
import type { IBackground } from '../background/IBackground';

export const BackgroundContext = createContext<IBackground | null>(null);
