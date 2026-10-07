# Design · add-class-booking

## Context

Proyecto Expo SDK 57 (React Native 0.86, TypeScript 6 estricto) recién creado, sin código de negocio. Motivación y alcance: ver `proposal.md`; comportamiento exigido: specs `class-booking` y `booking-data-protection`. Restricciones que moldean el diseño:

- Datos 100 % locales: catálogo empaquetado con fechas **relativas** (`diaOffset`) y reservas en el dispositivo.
- La hora de negocio es America/Bogota y no la del dispositivo.
- Se exige seguridad "nivel fintech" para las reservas guardadas (datos personales: revelan cuándo estará la socia en un lugar).
- Debe correr en Expo Go (sin módulos nativos propios) y verificarse con Jest.

## Goals / Non-Goals

**Goals:**
- Reglas RN-01..RN-04 en un dominio puro, 100 % probado sin React ni Expo.
- Cada pieza sustituible por su interfaz (pruebas con dobles, nuevas fuentes de datos sin tocar reglas).
- Reservas cifradas en reposo con llave custodiada por el sistema operativo y falla segura.
- Determinismo temporal: toda lectura de "ahora" pasa por un reloj inyectable.

**Non-Goals:**
- Sincronización con backend, multiusuario o soporte web.
- Pulido visual más allá de una UI clara y accesible.
- Protección contra un atacante con el dispositivo desbloqueado y root (ver Risks).

## Decisions

### D1 · Estructura del proyecto: Clean Architecture por capas
```
app/                 rutas expo-router (solo composición): _layout (Tabs + provider), index, reservas
src/domain/          TS puro: model/, time/, rules/, errors/
src/application/     ports/ (interfaces) + use-cases/ + SerialExecutor
src/infrastructure/  catalog/, persistence/, security/, time/, ids/, logging/
src/presentation/    screens/, components/, hooks/ (view-models), messages.ts, formatters.ts
src/di/              composition root: único lugar que instancia adaptadores
```
La dependencia apunta siempre hacia adentro (presentation → application → domain; infrastructure → application). ESLint (`no-restricted-imports`) rompe el build si una capa importa algo prohibido. *Alternativa considerada:* estructura por pantallas ("feature folders") — más simple, pero mezcla reglas con UI y no permite probar las reglas sin React.

### D2 · Dónde viven las reglas de negocio
Cada regla es una clase del dominio que implementa `BookingRule` o `CancellationRule` y devuelve `Result` con un código de error (`CLASS_FULL`, `ALREADY_BOOKED`, `DAILY_LIMIT_REACHED`, `CANCELLATION_WINDOW_CLOSED`). `BookClass` recibe un **arreglo ordenado** de reglas: el orden implementa la prioridad de mensajes (RN-02 → RN-01 → RN-03) y una regla nueva se agrega sin modificar el caso de uso. Los textos al usuario no están en el dominio: `presentation/messages.ts` es un `Record<ErrorCode, string>` exhaustivo (TypeScript obliga a definir el mensaje de cada código nuevo). Errores de negocio = valores (`Result`), no excepciones; las excepciones quedan para fallas técnicas.

### D3 · Cálculo de fechas (diaOffset + hora)
- `Clock.now()` devuelve epoch en ms; producción usa `SystemClock`, pruebas `FixedClock`.
- Bogotá no tiene horario de verano desde 1993: se usa un **offset fijo de −5 h**. Fecha de negocio de un instante = `new Date(epoch − 5 h)` leída con getters **UTC**; inicio de una clase = `Date.UTC(año, mes, día + diaOffset, hh + 5, mm)` (Date.UTC resuelve el cambio de mes/año).
- Nunca se usan getters locales (`getHours`, `getDate`); la suite corre en UTC+14 para detectar cualquier fuga de la zona del dispositivo.
- Identidad de sesión: `claseId@AAAA-MM-DD`. La reserva guarda una instantánea (`classId`, `sessionDate`, `startsAt`, `durationMin`, `className`, `instructor`), porque al día siguiente el mismo `diaOffset` apunta a otra fecha.
- "Ya comenzó" = `startsAt ≤ now`; RN-04 = `startsAt − now ≥ 2 h` (supuesto S1).
- *Alternativa descartada:* zona del dispositivo o librería de zonas (date-fns-tz/Luxon). La primera da fechas erróneas si el teléfono está en otra zona; la segunda agrega una dependencia y depende de los datos de zona de Intl en Hermes, innecesario con un offset fijo. Si el negocio se expande a zonas con horario de verano, se cambia solo `domain/time`.

### D4 · Manejo de estado
- Fuente de verdad: el `BookingRepository` (memoria + almacenamiento cifrado). El catálogo es inmutable.
- Cada pantalla usa un hook view-model (`useUpcomingClasses`, `useMyBookings`) que llama casos de uso, expone `loading | ready | error`, la acción en curso y el mensaje de retroalimentación. Recarga al enfocar la pestaña (`useFocusEffect`), así ambas pestañas reflejan los cambios de la otra.
- Las dependencias llegan por `DependenciesProvider` (React Context) creado en `app/_layout.tsx`.
- *Alternativa descartada:* Redux/Zustand. Dos pantallas con estado derivado del repositorio no justifican un store global ni otra dependencia; duplicaría la fuente de verdad.

### D5 · Concurrencia
`BookClass` y `CancelBooking` comparten un `SerialExecutor` (cola de promesas): leer reservas → validar reglas → escribir ocurre de forma atómica respecto a otras operaciones. Evita el TOCTOU de un doble toque o de dos reservas simultáneas que burlarían RN-02/RN-03. La UI además deshabilita el botón mientras la operación está en curso.

### D6 · Persistencia segura (envelope encryption)
```
Booking[] → JSON validado → AES-256-GCM (nonce 12 B aleatorio, AAD = clave+versión) → {"v":1,"alg":"A256GCM","data":<base64>} → AsyncStorage
                                    ↑ DEK 256 bits ← SecureStore (Keystore/Keychain, WHEN_UNLOCKED_THIS_DEVICE_ONLY)
```
- **Por qué AsyncStorage + SecureStore y no solo SecureStore:** SecureStore está pensado para secretos pequeños (iOS ha rechazado valores de más de ~2 KB); la lista de reservas crece. El patrón estándar es guardar solo la llave en el almacén seguro y los datos cifrados en almacenamiento general.
- **Cifrado:** `expo-crypto` (AES-GCM nativo: CryptoKit en iOS, javax.crypto en Android; disponible en Expo Go). GCM autentica: cualquier alteración del texto cifrado o de la AAD falla al descifrar. La AAD liga el contenido a su ranura y versión (no se puede trasplantar un blob a otra clave).
- **Llave:** se genera en el dispositivo (`AESEncryptionKey.generate(256)`), se guarda en hex en SecureStore con `WHEN_UNLOCKED_THIS_DEVICE_ONLY` (no migra por iCloud ni respaldos) y se cachea en memoria durante la sesión.
- **Composición SOLID:** `EncryptedKeyValueStore` es un **decorador** de `KeyValueStore` (misma interfaz que `AsyncStorageKeyValueStore`); `PersistentBookingRepository` no sabe que hay cifrado. `Cipher`, `SecretStore` y `KeyValueStore` son puertos con adaptadores Expo.
- **Lectura fail-closed:** sobre inválido, versión desconocida, GCM fallido, llave ausente o JSON fuera de esquema → borrar, devolver `[]` y registrar `storage.integrity_failure`.
- **Escritura write-through:** se cifra y guarda primero; la caché en memoria solo cambia si el guardado tuvo éxito. Si falla, el caso de uso devuelve `UNEXPECTED` y la UI muestra el mensaje genérico. Nunca hay escritura en claro porque la única ruta de escritura es el decorador.
- **Minimización:** la reserva guarda `memberId` pero no el nombre de la socia; `PurgeExpiredBookings` elimina al iniciar las reservas de días anteriores.
- `android.allowBackup: false` en `app.json` (los datos no salen por respaldo automático ni `adb backup`).
- *Alternativas descartadas:* (a) **@noble/ciphers** (AES-GCM en JS puro, auditado): permitiría pruebas con el algoritmo real sin mocks, pero agrega una dependencia de terceros cuando el SDK ya ofrece AES-GCM nativo; en Jest se usa un doble de `expo-crypto` que implementa AES-GCM real con WebCrypto de Node. (b) **expo-sqlite con SQLCipher**: más pesado y fuera de Expo Go para este volumen de datos.

### D7 · Validación en las fronteras
`zod` valida el catálogo (`clases.json`) y el contenido descifrado. Catálogo inválido → estado de error de la pantalla. *Alternativa:* validadores manuales — menos dependencias pero más código propio por mantener y probar; zod no tiene dependencias y su esquema documenta el contrato.

### D8 · Registros
Puerto `Logger` con eventos por código (`storage.integrity_failure`, `storage.write_failure`...) y metadatos sin PII. `ConsoleLogger` solo escribe si `__DEV__`; en producción es silencioso (punto de extensión para un monitor externo).

### D9 · Navegación y UI
expo-router con `Tabs` en `app/`: "Próximas clases" (`index`) y "Mis reservas" (`reservas`). Confirmación de cancelación con un `ConfirmDialog` propio sobre `Modal` (probable con Testing Library y consistente entre plataformas). Retroalimentación con un `FeedbackBanner` con `accessibilityLiveRegion` para lectores de pantalla. Iconos con `@expo/vector-icons` (paquete de Expo).

### D10 · Mapa SOLID
| Principio | Dónde se cumple |
|---|---|
| **S** — una responsabilidad | Una clase por regla, por caso de uso y por adaptador; hooks = estado de pantalla; componentes = presentación. |
| **O** — abierto/cerrado | Reglas inyectadas como arreglo; cifrado agregado como decorador; mensajes como mapa exhaustivo. |
| **L** — sustitución | Suite de contrato común que corre contra `InMemoryBookingRepository` y `PersistentBookingRepository`; `EncryptedKeyValueStore` sustituye a cualquier `KeyValueStore`. |
| **I** — interfaces pequeñas | Puertos de 1–3 métodos (`Clock`, `IdGenerator`, `ClassCatalog`, `Cipher`, `SecretStore`...); la UI solo ve las interfaces de los casos de uso. |
| **D** — inversión de dependencias | Casos de uso dependen de puertos; adaptadores Expo solo se instancian en `src/di`; ESLint impide atajos. |

### D11 · Dependencias nuevas
expo-router (+ react-native-safe-area-context, react-native-screens, expo-linking, expo-constants, expo-status-bar) para navegación; expo-secure-store y expo-crypto para custodia de llave y cifrado; @react-native-async-storage/async-storage para persistencia; zod para validación; @expo/vector-icons para iconos. Todas son de Expo o ampliamente auditadas; versiones fijadas por `package-lock.json`.

## Risks / Trade-offs

- [Las reglas dependen del reloj del dispositivo; la socia puede adelantarlo o atrasarlo] → Aceptado en un MVP sin backend; en producción RN-01..RN-04 deben validarse en el servidor y el cliente queda como primera línea.
- [Desinstalar la app pierde las reservas (Android borra SecureStore y AsyncStorage)] → Aceptado: el MVP no tiene backend; queda en el checklist de release.
- [En iOS la llave sobrevive a la desinstalación, AsyncStorage no] → Sin impacto: al reinstalar no hay datos y la llave vieja se reutiliza o se reemplaza.
- [Dispositivo con root y desbloqueado puede usar el Keystore como oráculo] → Fuera del modelo de amenaza del MVP; mitigable con attestation y detección de root cuando exista backend.
- [El doble de `expo-crypto` en Jest podría no reflejar la API real] → El doble implementa AES-GCM real y la prueba en emulador (Expo Go y APK) valida el adaptador real.
- [Purga al iniciar reduce historial] → Intencional (minimización); no hay requisito de historial.
- [Ambigüedad del límite de RN-04 (≥ 2 h vs > 2 h)] → Supuesto S1 aplicado y probado en el borde exacto; cambiarlo afecta una comparación y un escenario.

## Migration Plan

Primera versión: no hay datos previos. El formato persistido lleva versión (`v: 1`); una versión futura agregará una migración explícita y, mientras tanto, cualquier versión desconocida se trata con falla segura (se descarta). Rollback: desinstalar la versión (no hay estado en servidor).

## Open Questions

- Confirmar con el PO el límite exacto de RN-04 (supuesto S1) y los textos nuevos del supuesto S9. No cambian la arquitectura ni el plan de tareas.
