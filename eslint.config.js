// ESLint flat config: Expo rules + architectural boundaries (Clean Architecture / DIP).
// Each layer may only depend inwards: presentation -> application -> domain.
// Infrastructure implements application ports; src/di (composition root) wires everything.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const FRAMEWORKS = [
  'react',
  'react/*',
  'react-native',
  'react-native/*',
  'react-native-*',
  'expo',
  'expo-*',
  '@expo/*',
  '@react-native-async-storage/*',
];

const UI_FORBIDDEN = [
  '@/infrastructure/*',
  '**/infrastructure/**',
  'expo-secure-store',
  'expo-crypto',
  '@react-native-async-storage/*',
];

const restrict = (files, groups, message) => ({
  files,
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: groups, message }] }],
  },
});

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '.expo/**',
      'dist/**',
      'android/**',
      'ios/**',
      'Keppri_Espartanos_Prueba_Tecnica_ReactNative/**',
    ],
  },
  restrict(
    ['src/domain/**/*.{ts,tsx}'],
    [...FRAMEWORKS, 'zod', '@/application/*', '@/infrastructure/*', '@/presentation/*', '@/di/*', '**/application/**', '**/infrastructure/**', '**/presentation/**', '**/di/**'],
    'El dominio es TypeScript puro: no depende de frameworks, librerías ni capas externas.',
  ),
  restrict(
    ['src/application/**/*.{ts,tsx}'],
    [...FRAMEWORKS, '@/infrastructure/*', '@/presentation/*', '@/di/*', '**/infrastructure/**', '**/presentation/**', '**/di/**'],
    'La capa de aplicación solo depende del dominio y de sus propios puertos.',
  ),
  restrict(
    ['src/infrastructure/**/*.{ts,tsx}'],
    ['@/presentation/*', '@/di/*', '**/presentation/**', '**/di/**'],
    'La infraestructura implementa puertos; no conoce la UI ni el composition root.',
  ),
  // Note: in flat config a later block replaces the options of the same rule, so each
  // file set gets exactly one no-restricted-imports block with all of its groups.
  restrict(
    ['src/presentation/**/*.{ts,tsx}'],
    [...UI_FORBIDDEN, '@/di/*', '**/di/**'],
    'La UI usa casos de uso inyectados por contexto: no accede a adaptadores, almacenamiento, cifrado ni al composition root.',
  ),
  restrict(
    ['App.tsx', 'index.ts'],
    UI_FORBIDDEN,
    'La raíz solo compone el composition root y la navegación; no accede a adaptadores, almacenamiento ni cifrado.',
  ),
]);
