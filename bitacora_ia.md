# Bitácora de uso de IA

## Herramientas que usé
- **Claude Code** (modelo Claude Opus 5.5) en la app de escritorio de Claude, pestaña Code: planeación, generación de artefactos, código, pruebas y comandos.
- **OpenSpec 1.14.1**: CLI (`new change`, `status`, `instructions`, `validate`, `archive`) y skills `/opsx:propose` y `/opsx:apply` generadas por `openspec init` para Claude Code. El archivo se hizo con `openspec archive`, como indica la guía.
- **Expo CLI / create-expo-app** (SDK 57, plantilla `blank-typescript`) y `expo-doctor`.
- **Jest + jest-expo + React Native Testing Library**, **ESLint** (flat config) y **TypeScript 6** en modo estricto.
- **git-flow (AVH 1.12.3)** para ramas y merges `--no-ff`.
- **EAS CLI 24.11** (`init`, `build:configure`, `build`) para el proyecto en Expo y el build Android en la nube.
- **Android SDK**: emulador Pixel 7 (API 33), `adb` y `aapt` para el smoke test y la revisión del APK.

## Prompts clave (3 a 5)
| # | Fase | Prompt | Qué obtuve |
|---|---|---|---|
| 1 | Plan | "Actúa como desarrollador experto en React Expo… usa OpenSpec para correr el ciclo completo (propuesta, specs, diseño, tareas, implementación y archivo)… GitFlow con un commit por fase… SOLID sin excepción y seguridad como si fuera una fintech… AsyncStorage cuidando la seguridad con KeyStorage… Jest… Expo + EAS." | Plan con supuestos, arquitectura por capas, modelo de seguridad, lista de requisitos/escenarios y fases. Antes de planear, la IA verificó el entorno (OpenSpec ya inicializado, emulador, versiones vigentes de Expo y EAS). |
| 2 | Plan | "Agrega el README de cómo correr la app y las pruebas… lenguaje coherente, sin ambigüedades… opción de idioma español o inglés." | `README.md` (español) + `README.en.md` (inglés) con selector de idioma y una prueba Jest que impide que los dos idiomas diverjan. |
| 3 | 2 · Spec | `/opsx:propose add-class-booking` con el insumo (HU-01..03, RN-01..04) y el pedido de protección de datos. | `proposal.md` con supuestos S1–S9 y matriz de trazabilidad, specs delta `class-booking` (12 requisitos, 33 escenarios) y `booking-data-protection` (6 requisitos, 16 escenarios), `design.md` y `tasks.md` (7 grupos, 30 tareas). |
| 4 | 3 · Apply | `/opsx:apply add-class-booking`, con la guía del proyecto de escribir primero las pruebas desde los escenarios (TDD). | 30/30 tareas marcadas; 326 pruebas en verde (42 suites); suites de aceptación con un `it` por Scenario y prueba de trazabilidad spec→pruebas; smoke test en emulador Android con capturas en `docs/evidencias/`. |
| 5 | 4 · Archive y release | `openspec archive add-class-booking --yes`, configurar `app.json` y `eas.json` para Google Play y App Store y lanzar el build Android `preview` en la nube. | Specs vigentes en `openspec/specs/` (18 requisitos), cambio en `openspec/changes/archive/2026-10-06-add-class-booking/`, proyecto EAS vinculado, `eas.json` con `preview` y `production`, `checklist_release.md` y APK de release generado en EAS (enlace en el checklist). |

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
| 14 | El `design.md` nombraba piezas que el código terminó llamando distinto (`SerialExecutor` en lugar del puerto `TaskQueue` con `SerialTaskQueue`, y un evento `storage.write_failure` que no existe). | Revisión final con `grep` de los nombres del diseño contra el código. | Se corrigió el `design.md` y `tasks.md` del cambio archivado para que describan lo construido. |

## Compuertas por fase
| Fase | Compuerta | Resultado |
|---|---|---|
| 1 · Setup | `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor` | En verde; expo-doctor 21/21 checks. |
| 2 · Spec | Auto-revisión spec↔insumo (cada criterio de HU-01..03 y cada mensaje de RN-01..04 citado literal; reglas inventadas marcadas como supuesto) + `openspec validate add-class-booking --strict` | Válido. El usuario eligió ejecutar el ciclo de corrido: la aprobación del plan (con requisitos, escenarios y supuestos) fue la compuerta humana. |
| 3 · Apply/Verify | `npm run verify` (typecheck, lint con fronteras de capas, 326 pruebas, umbrales de cobertura y `openspec validate --all --strict`) + trazabilidad spec→pruebas + smoke test en emulador | En verde. Cobertura: dominio y aplicación 100 % de líneas; total 99,43 % sentencias y 95,54 % ramas. En el dispositivo se verificaron reserva, "Llena", RN-03, cancelación con confirmación, RN-04 (cambiando el reloj), persistencia tras reiniciar y ausencia de texto en claro en AsyncStorage. |
| 4 · Archive/Release | `openspec archive` (solo un aviso no bloqueante: "Consider splitting changes with more than 10 deltas") + `openspec validate --all --strict` sobre las specs vigentes + pruebas de configuración de release | En verde. Para la próxima iteración, el aviso sugiere separar cambios grandes (por ejemplo, reglas y protección de datos en dos cambios). |
| 5 · Release/Reflexión | Build `preview` en EAS (12 min, versionCode 1) + APK instalado en el emulador: smoke test, `aapt dump permissions`, `dumpsys package` y revisión del almacenamiento con `adb root` + clon limpio del repositorio con `npm ci` y `npm run verify` | En verde. El APK funciona sin permiso de red, sin `ALLOW_BACKUP` y sin texto en claro en AsyncStorage. Hallazgo: expo-secure-store agrega `USE_BIOMETRIC` y `USE_FINGERPRINT`, que la app no usa; quedó en el checklist como endurecimiento para el próximo build. |

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

## Iteración 1.1.0 · mejora visual (`refresh-mobile-ux-ui`)

### Cómo se trabajó
- **Primera versión:** la generó un asistente de IA en otra sesión, a partir del mockup de referencia. Llegó al repositorio sin commit, con 9/9 tareas marcadas y `npm run verify` en verde.
- **Revisión y cierre (Claude Code):**
  - Revisé esa versión contra el mockup, el insumo y `CLAUDE.md`.
  - Primero reescribí la spec, el diseño y las tareas, y después corregí con TDD.
  - Validé en el emulador y lo integré con GitFlow (`feature/refresh-mobile-ux-ui` y `release/1.1.0`).
- **Herramientas nuevas:**
  - `adb` y `uiautomator` para recorrer los flujos y tomar las capturas.
  - Windows PowerShell con GDI+ (`scripts/export-brand-assets.ps1`) para exportar la marca a PNG desde su SVG.
  - `expo-doctor` y `npx expo config` para validar la configuración nativa.

### Prompts clave
| # | Fase | Prompt | Qué obtuve |
|---|---|---|---|
| 6 | 1.1.0 · Mejora visual | "Mejora visual según el mockup, sin salir del alcance del MVP" (resumen del pedido de la sesión que generó la primera versión). | Cambio `refresh-mobile-ux-ui` con spec `app-shell`, tema oscuro, splash, perfil y detalle de clase, sin commit. |
| 7 | 1.1.0 · Revisión | "Integra el ajuste con GitFlow, revisa lo que quedó pendiente, mira si se apega el diseño al propuesto y actualiza los PNG o archivos de pruebas cuando todo esté ok." | <ul><li>Hallazgos de la revisión (tabla siguiente).</li><li>Spec reescrita: 11 requisitos y 27 escenarios concretos.</li><li>Correcciones con TDD.</li><li>Marca, ícono y splash nativo.</li><li>11 capturas nuevas en `docs/evidencias/`.</li><li>Cambio archivado y versión 1.1.0.</li></ul> |

### Errores de la IA que detecté
| # | Qué hizo mal | Cómo lo detecté | Cómo lo resolví |
|---|---|---|---|
| 15 | La primera versión escribió "Laura", "Laura Gómez" y "S-0001" dentro de las pantallas, en lugar de leerlos de los datos. | Revisión del diff y búsqueda de esos textos en `src/presentation`. | Caso de uso de solo lectura `GetMemberProfile`. Una prueba de aceptación con otra socia ("Marta Ruiz") demuestra que no están escritos en la pantalla. |
| 16 | Insertó la pestaña Perfil en medio (Próximas · Perfil · Mis reservas). | Comparación con el mockup. | Orden del mockup, con una prueba que verifica el orden de las pestañas. |
| 17 | La paleta no era la del mockup (`#081220`, `#0B1B2C`, `#A8B8C8`), y una prueba fijaba esos valores. | Comparación con la "Paleta de colores" del mockup. | Tokens exactos del mockup y una prueba que calcula el contraste WCAG de cada par de texto y fondo. |
| 18 | Barra de estado con íconos oscuros sobre el fondo oscuro, y tema claro de React Navigation. | Revisión de `AppRoot.tsx`. | Íconos claros y tema oscuro de navegación. |
| 19 | Puso los textos nuevos dentro de los componentes, contra la regla de `CLAUDE.md`. | Revisión del diff. | Todos los textos están en `messages.ts`. |
| 20 | El perfil ofrecía "Notificaciones" y "Ayuda y soporte" con flecha pero sin acción. Las notificaciones están fuera del alcance del insumo. | Comparación con la sección de alcance del insumo. | Se quitaron, y el escenario "Sin opciones fuera del alcance" lo prueba. |
| 21 | El detalle guardaba una copia de la clase: al reservar desde ahí no se actualizaba, y el mensaje quedaba oculto detrás del modal. | Lectura de `UpcomingClassesScreen` y del detalle. | El detalle lee la clase viva y muestra el aviso adentro. También permite cancelar con el mismo flujo de "Mis reservas" (`useCancellation`). |
| 22 | Usaba la misma descripción ("alta intensidad") para todas las clases, incluidas Yoga y Rumba. | Revisión del detalle. | Descripción y etiquetas por disciplina. La de Spinning es la del mockup (supuesto UI-3). |
| 23 | Los chips de día eran fijos ("Hoy", "Mañana", "Pasado mañana") y no hacían nada. | Revisión de la pantalla. | Selector de día que lleva a la sección del día sin ocultar las demás, como pide HU-01. |
| 24 | La prueba del escenario "Error visible y legible" no provocaba ningún error, y la de "Reservas visibles con el nuevo estilo" usaba una lista vacía. | Lectura de cada prueba frente a su escenario. | Pruebas reescritas desde escenarios concretos (por ejemplo, el aviso de error de RN-03 con rol de alerta). |
| 25 | El `design.md` hablaba de un detalle "anidado" en la navegación, pero el código usaba un `Modal`. | Comparación del diseño con el código. | El diseño describe lo construido (D4). |
| 26 | En esta revisión, la flecha "Volver" del detalle quedó debajo de la barra de estado. El modal se dibuja bajo la barra, pero tomaba las medidas de área segura de la ventana principal. | Captura en el emulador. | `SafeAreaProvider` propio dentro del modal. Se verificó en el emulador, porque el doble de Jest devuelve medidas fijas. |
| 27 | Para quitar las advertencias de `act()` probé primero esperas fijas de 50 ms, que daban resultados intermitentes, y luego simular el módulo nativo de animaciones, que rompió React Native. | Varias corridas de la suite y un registro temporal de los temporizadores: React Navigation programaba su temporizador 46 ms después de que empezaba la espera. | <ul><li>Una actualización fuera de `act()` hace fallar la prueba.</li><li>Se ignora solo la actualización interna de `BottomTabView`, con el motivo documentado.</li><li>El estado del splash pasó a su propio componente para no volver a renderizar el navegador.</li></ul> |
| 28 | Al restaurar el reloj del emulador después de probar RN-04, usé `TZ=America/Bogota date` en Git Bash, que ignora esa zona. El emulador quedó 5 horas adelantado unos segundos. | Comparación de `adb shell date` con la hora del equipo. | Se usó la hora local del equipo, que también es UTC−5. |
| 29 | En el dispositivo, el lema del splash se partía distinto del mockup ("Tu energía, nuestras / clases"). | Ráfaga de capturas durante el arranque en el emulador. | Salto de línea explícito después de la coma. |

### Compuertas
| Fase | Compuerta | Resultado |
|---|---|---|
| 6 · Revisión de la mejora visual | Spec, diseño y tareas reescritos con `openspec validate refresh-mobile-ux-ui --strict`; pruebas primero (TDD); `npm run verify`; `npx expo-doctor`; revisión en el emulador contra el mockup | <ul><li>`openspec validate`: cambio válido.</li><li>`npm run verify`: 50 suites, 421 pruebas, 100 % de líneas, 99,45 % de sentencias, 94,63 % de ramas y ninguna salida en consola.</li><li>`expo-doctor`: 21/21 checks.</li><li>19/19 tareas.</li></ul> |
| 7 · Archive y release 1.1.0 | `openspec archive refresh-mobile-ux-ui --yes` (aviso no bloqueante de más de 10 deltas: el cambio tiene 11 requisitos), seguido de `openspec validate --all --strict` y de las pruebas de configuración de release | En verde. Versión 1.1.0 en `app.json` y `package.json`. |

### Resultado de `openspec validate`
```
$ openspec validate refresh-mobile-ux-ui --strict
Change 'refresh-mobile-ux-ui' is valid

# después de archivar (1.1.0)
$ openspec validate --all --strict
- Validating...
✓ spec/app-shell
✓ spec/booking-data-protection
✓ spec/class-booking
Totals: 3 passed, 0 failed (3 items)
```
