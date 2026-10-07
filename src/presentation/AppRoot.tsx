import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { AppDependencies } from './dependencies/DependenciesContext';
import { DependenciesProvider } from './dependencies/DependenciesContext';
import { useStartupPurge } from './hooks/useStartupPurge';
import { AppTabs } from './navigation/AppTabs';
import { SplashScreen } from './components/SplashScreen';

function StartupTasks() {
  useStartupPurge();
  return null;
}

/** Application shell. Receives its dependencies, so tests can render it with deterministic ones. */
export function AppRoot({ dependencies }: { dependencies: AppDependencies }) {
  const [navigationReady, setNavigationReady] = useState(false);

  return (
    <SafeAreaProvider>
      <DependenciesProvider value={dependencies}>
        <StartupTasks />
        <View style={styles.root}>
          <NavigationContainer onReady={() => setNavigationReady(true)}>
            <AppTabs />
          </NavigationContainer>
          {!navigationReady && (
            <View style={styles.splashOverlay}>
              <SplashScreen />
            </View>
          )}
        </View>
        <StatusBar style="dark" />
      </DependenciesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splashOverlay: StyleSheet.absoluteFill,
});
