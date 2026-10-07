import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { AppDependencies } from './dependencies/DependenciesContext';
import { DependenciesProvider } from './dependencies/DependenciesContext';
import { useStartupPurge } from './hooks/useStartupPurge';
import { AppTabs } from './navigation/AppTabs';

function StartupTasks() {
  useStartupPurge();
  return null;
}

/** Application shell. Receives its dependencies, so tests can render it with deterministic ones. */
export function AppRoot({ dependencies }: { dependencies: AppDependencies }) {
  return (
    <SafeAreaProvider>
      <DependenciesProvider value={dependencies}>
        <StartupTasks />
        <NavigationContainer>
          <AppTabs />
        </NavigationContainer>
        <StatusBar style="dark" />
      </DependenciesProvider>
    </SafeAreaProvider>
  );
}
