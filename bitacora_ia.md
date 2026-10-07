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

## Errores de la IA que detecté
| # | Qué hizo mal | Cómo lo detecté | Cómo lo resolví |
|---|---|---|---|
| 1 | Ejecutó `npx expo install jest-expo jest @types/jest … -- --save-dev` y Expo dejó `jest`, `jest-expo`, `@types/jest` y `eslint-config-expo` en `dependencies` (producción). | Revisando el diff de `package.json` después de la instalación. | Se movieron a `devDependencies`; las herramientas de prueba no deben viajar como dependencias de producción. |
| 2 | Forzó la zona horaria de las pruebas con `process.env.TZ` dentro de `setupFiles`. Jest ejecuta cada archivo en un sandbox con una copia de `process.env`, así que no tenía efecto y la suite corría en la zona de Colombia (justo la de negocio, que ocultaría errores de fechas). | La prueba centinela `__tests__/setup/timezone.test.ts` falló (offset 300 en vez de −840). | Se fija `TZ` al inicio de `jest.config.js` (proceso padre); los workers lo heredan. La centinela queda en la suite. |
| 3 | La primera centinela comparaba el offset de `new Date(0)`: en 1970 Kiritimati estaba en UTC−10:40, no en UTC+14. | Resultados distintos entre una prueba manual con la fecha actual y otra con la época Unix. | La centinela usa una fecha reciente (2026). |
| 4 | En la configuración de ESLint declaró dos bloques `no-restricted-imports` para `src/presentation`; en flat config el segundo reemplaza al primero y se perdía la prohibición de importar infraestructura. | Revisión del archivo antes de ejecutarlo. | Un solo bloque por conjunto de archivos; se comprobó con archivos "sonda" que violan cada frontera (ESLint los rechaza). |
| 5 | Al registrar la Fase 2 en esta bitácora escribió de memoria los totales de la spec (31 y 15 escenarios, 27 tareas). | Se contaron con `grep -c "#### Scenario:"` y `grep -c "^- [ ]"` antes del commit: 33, 16 y 30. | Se corrigieron los números; regla aplicada desde entonces: toda cifra de la bitácora sale de un comando, no de memoria. |

## Compuertas por fase
| Fase | Compuerta | Resultado |
|---|---|---|
| 1 · Setup | `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor` | En verde; expo-doctor 21/21 checks. |
| 2 · Spec | Auto-revisión spec↔insumo (cada criterio de HU-01..03 y cada mensaje de RN-01..04 citado literal; reglas inventadas marcadas como supuesto) + `openspec validate add-class-booking --strict` | Válido. El usuario eligió ejecutar el ciclo de corrido: la aprobación del plan (con requisitos, escenarios y supuestos) fue la compuerta humana. |

## Resultado de `openspec validate`
```
$ openspec validate add-class-booking --strict
Change 'add-class-booking' is valid

$ openspec validate --all --strict
- Validating...
✓ change/add-class-booking
Totals: 1 passed, 0 failed (1 items)
```
