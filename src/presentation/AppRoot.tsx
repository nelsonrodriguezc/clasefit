import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { AppDependencies } from './dependencies/DependenciesContext';
import { DependenciesProvider } from './dependencies/DependenciesContext';
import { useStartupPurge } from './hooks/useStartupPurge';
import { AppTabs } from './navigation/AppTabs';
import { navigationTheme } from './navigation/navigationTheme';
import { StartupSplash } from './startup/StartupSplash';

function StartupTasks() {
  useStartupPurge();
  return null;
}

interface Props {
  readonly dependencies: AppDependencies;
  /** Maximum time of the launch screen (tests use a short one). */
  readonly splashTimeoutMs?: number;
}

/** Application shell. Receives its dependencies, so tests can render it with deterministic ones. */
export function AppRoot({ dependencies, splashTimeoutMs }: Props) {
  return (
    <SafeAreaProvider>
      <DependenciesProvider value={dependencies}>
        <StartupTasks />
        <StartupSplash timeoutMs={splashTimeoutMs}>
          <NavigationContainer theme={navigationTheme}>
            <AppTabs />
          </NavigationContainer>
        </StartupSplash>
        <StatusBar style="light" />
      </DependenciesProvider>
    </SafeAreaProvider>
  );
}
