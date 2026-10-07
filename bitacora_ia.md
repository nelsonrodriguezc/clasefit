# Bitácora de uso de IA

## Herramientas que usé
- **Claude Code** (modelo Claude Opus 5.5) en la app de escritorio de Claude, pestaña Code: planeación, generación de artefactos, código, pruebas y comandos.
- **OpenSpec 1.14.1**: CLI (`new change`, `instructions`, `validate`, `archive`) y skills `/opsx:propose`, `/opsx:apply`, `/opsx:archive` generadas por `openspec init` para Claude Code.
- **Expo CLI / create-expo-app** (SDK 57, plantilla `blank-typescript`) y `expo-doctor`.
- **Jest + jest-expo + React Native Testing Library**, **ESLint** (flat config) y **TypeScript 6** en modo estricto.
- **git-flow (AVH 1.12.3)** para ramas y merges `--no-ff`.

## Prompts clave (3 a 5)
| # | Fase | Prompt | Qué obtuve |
|---|---|---|---|
| 1 | Plan | "Actúa como desarrollador experto en React Expo… usa OpenSpec para correr el ciclo completo (propuesta, specs, diseño, tareas, implementación y archivo)… GitFlow con un commit por fase… SOLID sin excepción y seguridad como si fuera una fintech… AsyncStorage cuidando la seguridad con KeyStorage… Jest… Expo + EAS." | Plan con supuestos, arquitectura por capas, modelo de seguridad, lista de requisitos/escenarios y fases. Antes de planear, la IA verificó el entorno (OpenSpec ya inicializado, emulador, versiones vigentes de Expo y EAS). |
| 2 | Plan | "Agrega el README de cómo correr la app y las pruebas… lenguaje coherente, sin ambigüedades… opción de idioma español o inglés." | `README.md` (español) + `README.en.md` (inglés) con selector de idioma y una prueba Jest que impide que los dos idiomas diverjan. |
| 3 | 2 · Spec | `/opsx:propose add-class-booking` con el insumo (HU-01..03, RN-01..04) y el pedido de protección de datos. | `proposal.md` con supuestos S1–S9 y matriz de trazabilidad, specs delta `class-booking` (12 requisitos, 33 escenarios) y `booking-data-protection` (6 requisitos, 16 escenarios), `design.md` y `tasks.md` (7 grupos, 30 tareas). |
| 4 | 3 · Apply | `/opsx:apply add-class-booking`, con la guía del proyecto de escribir primero las pruebas desde los escenarios (TDD). | 30/30 tareas marcadas; 326 pruebas en verde (42 suites); suites de aceptación con un `it` por Scenario y prueba de trazabilidad spec→pruebas; smoke test en emulador Android con capturas en `docs/evidencias/`. |
| 5 | 4 · Archive y release | `openspec archive add-class-booking --yes`, configurar `app.json` y `eas.json` para Google Play y App Store y lanzar el build Android `preview` en la nube. | Specs vigentes en `openspec/specs/` (18 requisitos), cambio en `openspec/changes/archive/2026-10-06-add-class-booking/`, proyecto EAS vinculado, `eas.json` con `preview` y `production`, `checklist_release.md` y build en la nube en curso. |

## Errores de la IA que detecté
| # | Qué hizo mal | Cómo lo detecté | Cómo lo resolví |
|---|---|---|---|
| 1 | Ejecutó `npx expo install jest-expo jest @types/jest … -- --save-dev` y Expo dejó `jest`, `jest-expo`, `@types/jest` y `eslint-config-expo` en `dependencies` (producción). | Revisando el diff de `package.json` después de la instalación. | Se movieron a `devDependencies`; las herramientas de prueba no deben viajar como dependencias de producción. |
| 2 | Forzó la zona horaria de las pruebas con `process.env.TZ` dentro de `setupFiles`. Jest ejecuta cada archivo en un sandbox con una copia de `process.env`, así que no tenía efecto y la suite corría en la zona de Colombia (justo la de negocio, que ocultaría errores de fechas). | La prueba centinela `__tests__/setup/timezone.test.ts` falló (offset 300 en vez de −840). | Se fija `TZ` al inicio de `jest.config.js` (proceso padre); los workers lo heredan. La centinela queda en la suite. |
| 3 | La primera centinela comparaba el offset de `new Date(0)`: en 1970 Kiritimati estaba en UTC−10:40, no en UTC+14. | Resultados distintos entre una prueba manual con la fecha actual y otra con la época Unix. | La centinela usa una fecha reciente (2026). |
| 4 | En la configuración de ESLint declaró dos bloques `no-restricted-imports` para `src/presentation`; en flat config el segundo reemplaza al primero y se perdía la prohibición de importar infraestructura. | Revisión del archivo antes de ejecutarlo. | Un solo bloque por conjunto de archivos; se comprobó con archivos "sonda" que violan cada frontera (ESLint los rechaza). |
| 5 | Al registrar la Fase 2 en esta bitácora escribió de memoria los totales de la spec (31 y 15 escenarios, 27 tareas). | Se contaron con `grep -c "#### Scenario:"` y `grep -c "^- \[ \]"` antes del commit: 33, 16 y 30. | Se corrigieron los números; regla aplicada desde entonces: toda cifra de la bitácora sale de un comando, no de memoria. |
| 6 | Eligió expo-router para la navegación. En SDK 57 trae decenas de paquetes extra y peers nativos que npm resolvió en versiones incompatibles con el SDK (react-native-reanimated 4.7.1 y react-native-worklets 0.13.0 frente a 4.5.1 y 0.10.1 esperados), más un conflicto `react-dom@19.3.0` vs `react@19.2.3` que bloqueó `npm install`. | `npm install` falló con ERESOLVE; `npm ls` y `expo/bundledNativeModules.json` mostraron las versiones incompatibles. | Se cambió a React Navigation (la base de expo-router) con solo dos módulos nativos y se actualizó `design.md` (D9) como alternativa descartada. |
| 7 | No instaló `expo-asset`, que `expo-font` (usado por los íconos) requiere en tiempo de ejecución; la app habría fallado al cargar las fuentes. | Las pruebas de UI fallaron con `Cannot find module 'expo-asset'`. | `npx expo install expo-asset`; quedó registrado en proposal, design y tasks. |
| 8 | Usó `jest.requireMock` para acceder a los dobles: devuelve una instancia distinta del mock manual, así que el reinicio entre pruebas no tenía efecto. | La prueba de los dobles falló (`calls[0]` indefinido aunque `getItemAsync` devolvía el valor). | Los helpers importan el paquete por su nombre, igual que el código de producción. |
| 9 | En una prueba de aceptación usó `await import(...)`, que esta configuración de Jest no soporta. | La prueba falló con "dynamic import callback was invoked without --experimental-vm-modules". | Import estático. |
| 10 | Para probar el doble toque disparó dos `fireEvent.press` en paralelo (`act()` superpuestos), lo que dejó roto el entorno para las pruebas siguientes. | Dos pruebas que antes pasaban empezaron a fallar justo después de la nueva. | El doble toque se prueba en el hook (`renderHook`), donde las dos llamadas ocurren en el mismo tick. |
| 11 | Usó `FlatList` para listas de pocos elementos; su render diferido generaba advertencias de `act()` en las pruebas. | Salida de Jest con `console.error` de VirtualizedList. | `ScrollView` (como máximo tres días de clases y seis reservas). |
| 12 | Al volver a una pestaña seguía visible el mensaje de una acción anterior (por ejemplo, RN-03 ya no aplicaba después de cancelar en la otra pestaña). | Smoke test en el emulador. | Prueba de UI que lo reproduce y corrección: el mensaje se limpia cuando la pestaña pierde el foco. |
| 13 | Pasó a `AESSealedData.fromCombined` el texto base64 guardado, como permiten los tipos de expo-crypto. En Android el módulo nativo solo acepta bytes: al reabrir la app el descifrado fallaba, la falla segura descartaba las reservas y el doble de Jest (que seguía la documentación) no lo detectaba. | En el emulador, Metro registró `storage.integrity_failure {reason: decrypt_failed}` al reabrir; un log de diagnóstico temporal y la lectura del código Kotlin de expo-crypto confirmaron la causa. | Se hizo que el doble rechace cadenas como Android (la prueba "Reabrir la app conserva las reservas" pasó a fallar), se agregó un codec Base64 propio probado con el RFC 4648 y el cifrador solo cruza bytes por la frontera nativa. Verificado de nuevo en el emulador. |

## Compuertas por fase
| Fase | Compuerta | Resultado |
|---|---|---|
| 1 · Setup | `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor` | En verde; expo-doctor 21/21 checks. |
| 2 · Spec | Auto-revisión spec↔insumo (cada criterio de HU-01..03 y cada mensaje de RN-01..04 citado literal; reglas inventadas marcadas como supuesto) + `openspec validate add-class-booking --strict` | Válido. El usuario eligió ejecutar el ciclo de corrido: la aprobación del plan (con requisitos, escenarios y supuestos) fue la compuerta humana. |
| 3 · Apply/Verify | `npm run verify` (typecheck, lint con fronteras de capas, 326 pruebas, umbrales de cobertura y `openspec validate --all --strict`) + trazabilidad spec→pruebas + smoke test en emulador | En verde. Cobertura: dominio y aplicación 100 % de líneas; total 99,43 % sentencias y 95,54 % ramas. En el dispositivo se verificaron reserva, "Llena", RN-03, cancelación con confirmación, RN-04 (cambiando el reloj), persistencia tras reiniciar y ausencia de texto en claro en AsyncStorage. |
| 4 · Archive/Release | `openspec archive` (solo un aviso no bloqueante: "Consider splitting changes with more than 10 deltas") + `openspec validate --all --strict` sobre las specs vigentes + pruebas de configuración de release | En verde. Para la próxima iteración, el aviso sugiere separar cambios grandes (por ejemplo, reglas y protección de datos en dos cambios). |

## Resultado de `openspec validate`
```
$ openspec validate add-class-booking --strict
Change 'add-class-booking' is valid

$ openspec validate --all --strict
- Validating...
✓ change/add-class-booking
Totals: 1 passed, 0 failed (1 items)

# después de archivar (Fase 4)
$ openspec validate --all --strict
- Validating...
✓ spec/booking-data-protection
✓ spec/class-booking
Totals: 2 passed, 0 failed (2 items)
```
