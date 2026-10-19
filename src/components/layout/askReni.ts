/** Opens Reni from anywhere inside the signed-in layout; null elsewhere. */
import { createContext, useContext } from 'react';

export const AskContext = createContext<(() => void) | null>(null);

export const useAskTaqdeer = () => useContext(AskContext);
