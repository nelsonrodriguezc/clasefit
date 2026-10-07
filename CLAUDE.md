# CLAUDE.md · Reglas para asistentes de IA en ClaseFit

Contexto del producto y del stack: `openspec/config.yaml` (campo `context`). Insumo funcional: `docs/insumo/`.

## Flujo obligatorio (SDD con OpenSpec 1.14)
1. Ningún cambio de comportamiento sin spec: `/opsx:propose` → revisar → `/opsx:apply` → `/opsx:archive`.
2. Las pruebas salen de los `#### Scenario:` de la spec y llevan el mismo nombre (`__tests__/acceptance`).
3. Marcar `- [x]` en `tasks.md` solo cuando la verificación de la tarea pasa.
4. Antes de cada commit: `npm run verify` en verde.

## Arquitectura (SOLID sin excepción)
- `src/domain` es TypeScript puro; `src/application` define puertos y casos de uso; `src/infrastructure` implementa puertos; `src/presentation` solo UI; `src/di` es el único lugar que instancia adaptadores; `App.tsx` solo monta dependencias y navegación.
- Una responsabilidad por archivo; reglas nuevas = nuevas clases de regla (no `if` en el caso de uso).
- La UI nunca importa infraestructura ni librerías de almacenamiento/cifrado (lo impide ESLint).

## Seguridad (nivel fintech)
- Nunca persistir reservas sin cifrar ni guardar la llave fuera de SecureStore.
- Nunca registrar datos personales (nombre, id de socio, contenido de reservas) en logs.
- Validar con esquema todo dato que cruce una frontera (catálogo, almacenamiento).
- Ante datos corruptos o alterados: falla segura (descartar y limpiar), nunca "adivinar".
- No agregar dependencias sin justificarlas en `design.md`.

## Fechas
- Hora de negocio America/Bogota (UTC−5 fijo). Prohibido usar getters locales de `Date` (`getHours`, `getDate`...) en el dominio; usar el `Clock` inyectado.

## Textos
- Mensajes al usuario literales del insumo, centralizados en `src/presentation/messages.ts`.
