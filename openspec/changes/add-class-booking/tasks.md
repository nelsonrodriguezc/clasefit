# Tasks

## 1. Dependencias y punto de entrada

- [ ] 1.1 Instalar expo-router (con react-native-safe-area-context, react-native-screens, expo-linking, expo-constants), expo-secure-store, expo-crypto, @react-native-async-storage/async-storage, @expo/vector-icons y zod; verificar con `npx expo-doctor` sin problemas y que todo quede en `dependencies` (no en `devDependencies`)
- [ ] 1.2 Cambiar el punto de entrada a `expo-router/entry`, agregar `scheme` y el plugin `expo-router` en `app.json` y retirar `App.tsx`/`index.ts` de la plantilla (y su prueba smoke); verificar con `npm run typecheck` y `npm test`

## 2. Dominio: modelo, tiempo y cupos

- [ ] 2.1 Crear el modelo del dominio (`GymClass`, `ClassSession`, `Booking`, `Result` y códigos de error) en `src/domain`; verificar con `npm run typecheck` y `npm run lint` (el dominio no importa nada externo)
- [ ] 2.2 Implementar `src/domain/time` (fecha de negocio en Bogotá, inicio de sesión por `diaOffset` + `hora`, "ya comenzó"); verificar con pruebas unitarias de zona del dispositivo distinta, cambio de mes y de año, y clase que comienza en el instante actual
- [ ] 2.3 Implementar el cálculo de cupos disponibles (`cupoTotal − ocupados − reserva propia`) y el estado de la sesión (`available | full | booked`); verificar con pruebas de "5 de 20 cupos" sin reserva propia y "5 de 15 cupos" con reserva propia

## 3. Dominio: reglas de negocio RN-01 a RN-04

- [ ] 3.1 Definir `BookingRule` y `CancellationRule` e implementar RN-01 (clase sin cupos); verificar con pruebas unitarias de clase llena (rechazo) y último cupo (aceptación)
- [ ] 3.2 Implementar RN-02 (misma sesión = misma clase y fecha); verificar con pruebas de segunda reserva (rechazo) y misma clase en otra fecha (aceptación)
- [ ] 3.3 Implementar RN-03 (máximo 2 reservas por día de Bogotá, incluidas clases del día ya comenzadas); verificar con pruebas de tercera reserva, días distintos y clases ya comenzadas
- [ ] 3.4 Implementar RN-04 (cancelar si faltan 2 h o más); verificar con pruebas en 3 h, exactamente 2 h, 1 h 59 min y 1 ms antes del borde
- [ ] 3.5 Definir el orden de reglas por defecto RN-02 → RN-01 → RN-03; verificar con pruebas de clase ya reservada y llena (mensaje RN-02) y clase llena con límite diario alcanzado (mensaje RN-01)

## 4. Aplicación: puertos y casos de uso

- [ ] 4.1 Definir los puertos `Clock`, `ClassCatalog`, `BookingRepository`, `IdGenerator` y `Logger`, e implementar `SerialExecutor`; verificar con pruebas de ejecución en orden de tareas concurrentes y de que una tarea fallida no bloquea la cola
- [ ] 4.2 Implementar `ListUpcomingClasses` (ventana de 3 días, orden, clases iniciadas ocultas, estado por sesión, catálogo inválido → error); verificar con pruebas de orden, ventana, borde de inicio y estados `full`/`booked`
- [ ] 4.3 Implementar `BookClass` (re-validación de sesión vigente, reglas en orden, escritura serializada, falla técnica → `UNEXPECTED`); verificar con pruebas de reserva exitosa, clase ya comenzada, doble toque simultáneo y solicitudes simultáneas contra RN-03
- [ ] 4.4 Implementar `ListMyBookings` (solo no iniciadas, la más próxima primero) y `PurgeExpiredBookings` (días anteriores en Bogotá); verificar con pruebas de orden, reservas iniciadas ocultas y purga de ayer conservando mañana
- [ ] 4.5 Implementar `CancelBooking` con verificación previa (`check`) y re-validación al confirmar (`execute`); verificar con pruebas de cancelación permitida, plazo vencido durante la confirmación, reserva inexistente y liberación del límite diario

## 5. Infraestructura segura

- [ ] 5.1 Implementar `JsonClassCatalog` con esquema zod y copiar `clases.json` a `src/infrastructure/catalog`; verificar con pruebas de catálogo del insumo aceptado (10 clases), estructura inválida, `ocupados > cupoTotal` y copia idéntica a `docs/insumo/mock-data/clases.json`
- [ ] 5.2 Crear los dobles de Jest en `__mocks__/` (expo-crypto con AES-GCM real sobre WebCrypto de Node, expo-secure-store en memoria, mock oficial de AsyncStorage); verificar con una prueba de ida y vuelta y de rechazo por alteración del doble de AES-GCM
- [ ] 5.3 Implementar `ExpoSecretStore` y `SecureStoreKeyProvider` (llave de 256 bits, `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, caché en memoria); verificar con pruebas de generación en el primer uso, reutilización y opciones de accesibilidad
- [ ] 5.4 Implementar `ExpoAesGcmCipher` (nonce aleatorio, AAD) y `EncryptedKeyValueStore` (decorador con sobre versionado) sobre `AsyncStorageKeyValueStore`; verificar con pruebas de ida y vuelta, cifrados distintos para el mismo contenido, alteración del texto cifrado y AAD distinta
- [ ] 5.5 Implementar `PersistentBookingRepository` (write-through, fail-closed) e `InMemoryBookingRepository` con una suite de contrato común (LSP); verificar con pruebas de persistencia entre instancias, contenido sin texto plano, datos alterados, llave ausente, versión desconocida, estructura inválida, ausencia del nombre de la socia y error al guardar
- [ ] 5.6 Implementar `SystemClock`, `ExpoIdGenerator` y `ConsoleLogger` (silencioso fuera de `__DEV__`); verificar con pruebas de evento de integridad sin datos personales y de consola silenciosa en producción
- [ ] 5.7 Configurar `android.allowBackup: false` en `app.json`; verificar con una prueba de configuración

## 6. Presentación

- [ ] 6.1 Crear `messages.ts` (mapa exhaustivo por código con textos literales del insumo) y `formatters.ts` (día "Hoy" / "Mañana" / "Pasado mañana" con fecha, hora y "X de Y cupos"); verificar con pruebas de textos exactos y formatos
- [ ] 6.2 Crear `DependenciesProvider`, el composition root `src/di/createAppDependencies.ts` y el layout de pestañas en `app/`; verificar con `npm run typecheck`, `npm run lint` (fronteras) y una prueba del composition root
- [ ] 6.3 Implementar la pantalla "Próximas clases" (hook view-model, `ClassCard`, `FeedbackBanner`, estados de carga y error); verificar con pruebas de Testing Library de clase "Llena" sin botón, reserva exitosa con banner y cupos actualizados, mensajes RN-01 a RN-03 y catálogo inválido
- [ ] 6.4 Implementar la pantalla "Mis reservas" (hook view-model, `BookingCard`, `ConfirmDialog`, estado vacío); verificar con pruebas de Testing Library de "Aún no tienes reservas", cancelación confirmada, desistida, rechazada por RN-04 sin pedir confirmación y error al guardar

## 7. Verificación integral

- [ ] 7.1 Escribir las suites de aceptación `__tests__/acceptance/class-booking.test.ts` y `booking-data-protection.test.ts` (un `describe` por Requirement y un `it` por Scenario, con los mismos nombres) y una prueba de trazabilidad que falla si algún Requirement o Scenario de las specs no tiene prueba; verificar con `npm test`
- [ ] 7.2 Fijar umbrales de cobertura en `jest.config.js` según lo medido (dominio y aplicación ≥ 95 %); verificar con `npm run verify` completo en verde
- [ ] 7.3 Hacer el smoke test en el emulador Android con Expo Go (listar, reservar, RN-03, cancelar, reabrir la app y conservar reservas); verificar con capturas en `docs/evidencias/`
- [ ] 7.4 Completar `README.md` y `README.en.md` (pantallas, comandos verificados, enlaces a spec y design); verificar con la prueba de consistencia del README y ejecutando cada comando documentado

## Workflow follow-up

- Archivar el cambio con `openspec archive add-class-booking --yes` y validar con `openspec validate --all --strict`.
- Configurar el release (`app.json`, `eas.json`, `checklist_release.md`) en la rama `release/1.0.0`.
