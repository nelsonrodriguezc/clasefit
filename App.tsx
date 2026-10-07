import { createAppDependencies } from '@/di/createAppDependencies';
import { AppRoot } from '@/presentation/AppRoot';

// Composition happens once, when the app starts.
const dependencies = createAppDependencies();

export default function App() {
  return <AppRoot dependencies={dependencies} />;
}
