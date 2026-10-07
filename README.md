**Idioma / Language:** Español · [English](README.en.md)

# ClaseFit

App móvil para que los socios del gimnasio ClaseFit (Sede Laureles, Medellín) vean las próximas clases grupales, reserven un cupo y cancelen sus reservas desde el celular. Es el MVP de la prueba técnica de KEPPRI, construido con Spec-Driven Development (OpenSpec) sobre Expo + React Native + TypeScript.

> **Estado del repositorio:** Fase 2 (proposal, specs, design y tasks). Las pantallas y reglas de negocio se implementan en la Fase 3; las secciones marcadas como *pendiente* se completan en la fase indicada.

## 1. Qué es ClaseFit

- **Usuario:** una socia ya autenticada, Laura Gómez (no hay login).
- **Funciones:** ver las clases de hoy, mañana y pasado mañana; reservar; ver y cancelar mis reservas.
- **Reglas de negocio:** RN-01 a RN-04 del insumo funcional ([docs/insumo/insumo_funcional_ClaseFit.md](docs/insumo/insumo_funcional_ClaseFit.md)).
- **Datos:** locales. El catálogo viene de un JSON empaquetado y las reservas se guardan cifradas en el dispositivo. No hay backend.

## 2. Requisitos previos

| Herramienta | Versión mínima | Versión probada | Cómo comprobarla |
|---|---|---|---|
| Node.js | 20 | 22.23.3 | `node -v` |
| npm | 10 | 10.9.9 | `npm -v` |
| Git | 2.40 | 2.49.0 | `git --version` |
| Expo Go (Android o iPhone) | compatible con Expo SDK 57 | última versión de la tienda | si no es compatible, Expo Go lo indica al abrir el proyecto |
| Emulador Android (opcional) | Android 13 (API 33) | Pixel 7 · API 33 | Android Studio › Device Manager |

Necesitas **una** de estas dos opciones para ver la app: un celular con Expo Go o un emulador Android.

Comprueba las versiones:

```bash
node -v
```

```bash
npm -v
```

Resultado esperado: `v20.x.x` o mayor para Node y `10.x.x` o mayor para npm.

## 3. Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/nelsonrodriguezc/clasefit.git clasefit
   ```

2. Entra a la carpeta del proyecto:

   ```bash
   cd clasefit
   ```

3. Instala las dependencias exactas del `package-lock.json`:

   ```bash
   npm ci
   ```

   Resultado esperado: termina con `added N packages` y sin errores.

## 4. Ejecutar la app

1. Inicia el servidor de desarrollo:

   ```bash
   npx expo start
   ```

   Resultado esperado: la terminal muestra un código QR y el mensaje `Logs for your project will appear below`.

2. Abre la app con una de estas opciones:
   - **Emulador Android:** con el emulador encendido, presiona la tecla `a` en la terminal. Expo instala Expo Go si hace falta y abre ClaseFit.
   - **Celular Android:** abre Expo Go y escanea el código QR.
   - **iPhone:** abre la app Cámara y escanea el código QR.

3. Si el celular y el computador no están en la misma red Wi-Fi, detén el servidor (`Ctrl + C`) e inícialo en modo túnel:

   ```bash
   npx expo start --tunnel
   ```

*Pendiente (Fase 3):* descripción de las pantallas "Próximas clases" y "Mis reservas".

## 5. Ejecutar las pruebas

| Objetivo | Comando | Resultado esperado |
|---|---|---|
| Todas las pruebas | `npm test` | `Tests: N passed, N total` |
| Pruebas con cobertura | `npm run test:coverage` | resumen en la terminal y reporte HTML en `coverage/lcov-report/index.html` |
| Un archivo puntual | `npx jest __tests__/setup/timezone.test.ts` | `1 passed` |
| Tipos de TypeScript | `npm run typecheck` | termina sin mensajes |
| Estilo y fronteras de capas | `npm run lint` | termina sin mensajes |
| Todo lo anterior + OpenSpec | `npm run verify` | todos los pasos terminan sin error |

Corre todas las pruebas:

```bash
npm test
```

Corre la verificación completa (la misma que ejecuta la integración continua):

```bash
npm run verify
```

Las pruebas se ejecutan siempre con la zona horaria `Pacific/Kiritimati` (UTC+14), configurada en `jest.config.js`. Así se garantiza que el cálculo de fechas use la hora de Bogotá y no la del computador. No cambies la variable `TZ` al correr las pruebas.

## 6. Especificaciones con OpenSpec

El proyecto usa OpenSpec 1.14.1. `npm run spec:validate` lo descarga con `npx`, así que la instalación global es opcional. Para usar los comandos directamente, instálalo así:

```bash
npm install -g @fission-ai/openspec@1.14.1
```

Lista las capacidades especificadas:

```bash
openspec list --specs
```

Valida cambios y specs en modo estricto:

```bash
openspec validate --all --strict
```

| Ubicación | Contenido |
|---|---|
| `openspec/config.yaml` | Contexto del proyecto (en OpenSpec 1.14 reemplaza a `openspec/project.md`). |
| `openspec/changes/` | Cambios en curso (proposal, specs delta, design, tasks). |
| `openspec/specs/` | Especificación vigente, generada al archivar. |
| `openspec/changes/archive/` | Historial de cambios archivados. |

Cambio en curso: [`openspec/changes/add-class-booking/`](openspec/changes/add-class-booking/) con [proposal](openspec/changes/add-class-booking/proposal.md), specs [class-booking](openspec/changes/add-class-booking/specs/class-booking/spec.md) y [booking-data-protection](openspec/changes/add-class-booking/specs/booking-data-protection/spec.md), [design](openspec/changes/add-class-booking/design.md) y [tasks](openspec/changes/add-class-booking/tasks.md).

## 7. Build y publicación (EAS)

*Pendiente (Fase 4):* perfiles `preview` y `production`, comandos de build y enlace al APK. La lista de lo que falta para publicar en las tiendas estará en [checklist_release.md](checklist_release.md).

## 8. Arquitectura y seguridad

Arquitectura por capas (Clean Architecture) con principios SOLID y fronteras verificadas por ESLint:

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Dominio | `src/domain` | Modelo, cálculo de fechas y reglas RN-01 a RN-04. TypeScript puro. |
| Aplicación | `src/application` | Casos de uso y puertos (interfaces). |
| Infraestructura | `src/infrastructure` | Catálogo JSON, almacenamiento cifrado, llave segura, reloj. |
| Presentación | `src/presentation` | Pantallas, componentes, hooks y textos al usuario. |
| Composición | `src/di` y `app/` | Conecta implementaciones con casos de uso; rutas de expo-router. |

Las decisiones (estructura, estado, fechas, reglas, persistencia cifrada, mapa SOLID y alternativas descartadas) están en [design.md](openspec/changes/add-class-booking/design.md). Resumen de seguridad: las reservas se guardan en AsyncStorage solo cifradas con AES-256-GCM; la llave de 256 bits se genera en el dispositivo y vive únicamente en SecureStore (Keychain en iOS, Keystore en Android); si los datos guardados fueron alterados, se descartan (falla segura).

## 9. Estructura del repositorio

| Ruta | Contenido |
|---|---|
| `app/` | Rutas de expo-router (Fase 3). |
| `src/` | Código de la app por capas (Fase 3). |
| `__tests__/` | Pruebas de Jest. |
| `openspec/` | Contexto, cambios y especificaciones. |
| `docs/insumo/` | Insumo funcional y datos originales entregados por KEPPRI. |
| `.github/workflows/ci.yml` | Integración continua: typecheck, lint, pruebas y OpenSpec. |
| `CLAUDE.md` | Reglas para los asistentes de IA que trabajan en el repositorio. |

## 10. Supuestos clave

La lista completa (S1 a S9) está en [proposal.md](openspec/changes/add-class-booking/proposal.md#supuestos). Los que más afectan el comportamiento:

- **RN-04:** se puede cancelar si faltan 2 horas o más; con exactamente 2 horas se permite.
- **Fechas:** "hoy" es la fecha actual en America/Bogota (UTC−5), aunque el dispositivo esté en otra zona horaria.
- **Reserva = sesión:** una reserva identifica la clase y su fecha, porque `diaOffset` es relativo al día actual.
- **RN-03:** cuenta las reservas del día de la clase, incluidas las de clases de ese día que ya comenzaron.
- **Prioridad de mensajes:** si fallan varias reglas, se muestra RN-02, luego RN-01 y luego RN-03.

## 11. Flujo de trabajo Git (GitFlow)

| Rama | Uso |
|---|---|
| `main` | Versiones publicadas, con etiqueta (`v1.0.0`). |
| `develop` | Integración de las fases terminadas. |
| `feature/fase-N-*` | Una rama por fase, con **un commit por fase**, integrada a `develop` con merge `--no-ff`. |
| `release/1.0.0` | Archivo del cambio, configuración de release y documentación final. |

Revisa el historial completo:

```bash
git log --oneline --graph --all
```

## 12. Solución de problemas

| Síntoma | Solución |
|---|---|
| `Port 8081 is being used by another process` | Inicia Metro en otro puerto: `npx expo start --port 8082`. |
| Expo Go dice que el proyecto usa un SDK incompatible | Actualiza Expo Go desde la tienda; debe ser compatible con Expo SDK 57. |
| La app muestra código viejo o errores de caché | Reinicia limpiando la caché: `npx expo start -c`. |
| `npm ci` falla por versión de Node | Instala Node 20 o superior y repite `npm ci`. |

## 13. Entregables de la prueba

| Entregable | Archivo |
|---|---|
| Insumo funcional | [docs/insumo/insumo_funcional_ClaseFit.md](docs/insumo/insumo_funcional_ClaseFit.md) |
| Bitácora de uso de IA | [bitacora_ia.md](bitacora_ia.md) |
| Respuestas de reflexión | *pendiente (Fase 5)* |
| Checklist de release | *pendiente (Fase 4)* |
