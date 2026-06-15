import { createContext, useContext } from 'react';

export const DemoContext = createContext({ isDemo: false });
export const useDemo = () => useContext(DemoContext);
