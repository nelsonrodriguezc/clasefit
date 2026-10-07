import { createContext, useContext, useEffect } from 'react';

const ContentReadyContext = createContext<() => void>(() => undefined);

/** Receives the signal that the first screen has its content, so the launch screen can go away. */
export const ContentReadyProvider = ContentReadyContext.Provider;

/** A screen reports that its first content (or its error message) is on screen. */
export function useReportContentReady(ready: boolean): void {
  const markReady = useContext(ContentReadyContext);
  useEffect(() => {
    if (ready) markReady();
  }, [ready, markReady]);
}
