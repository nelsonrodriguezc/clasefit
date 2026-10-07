import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandSplash } from '../components/BrandSplash';
import { colors } from '../theme';
import { ContentReadyProvider } from './contentReady';

/** The launch screen never blocks the app: it goes away after this time even without the signal. */
export const SPLASH_TIMEOUT_MS = 3000;

interface Props {
  readonly children: ReactNode;
  readonly timeoutMs?: number;
}

/**
 * Shows the brand launch screen over the app until the first screen reports its content. The state
 * lives here, not in the app root: hiding the splash re-renders this component only, while the
 * navigator (passed as children) keeps its identity and is not rendered again.
 */
export function StartupSplash({ children, timeoutMs = SPLASH_TIMEOUT_MS }: Props) {
  const [contentReady, setContentReady] = useState(false);
  const markContentReady = useCallback(() => setContentReady(true), []);

  useEffect(() => {
    if (contentReady) return undefined;
    const timer = setTimeout(markContentReady, timeoutMs);
    return () => clearTimeout(timer);
  }, [contentReady, markContentReady, timeoutMs]);

  return (
    <ContentReadyProvider value={markContentReady}>
      <View style={styles.root}>
        {children}
        {!contentReady && <BrandSplash />}
      </View>
    </ContentReadyProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
