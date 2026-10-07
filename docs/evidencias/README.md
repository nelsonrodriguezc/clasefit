# Evidencias · smoke test en Android

Dispositivo: emulador Android **Pixel 7 · API 33** (imagen `google_apis`), app ejecutada en **Expo Go (SDK 57)** con `npx expo start`. Hora del dispositivo: America/Bogota.

Capturas de la **versión 1.1.0**, con la mejora visual `refresh-mobile-ux-ui`. Se tomaron el miércoles 7 de octubre de 2026 entre la 01:41 y la 01:54, salvo la 11, que usa el reloj del emulador adelantado. A esa hora ninguna clase del día había comenzado.

| # | Captura | Qué demuestra |
|---|---|---|
| 1 | [01-inicio-marca.png](01-inicio-marca.png) | Pantalla de inicio con la marca, el nombre y el lema "Tu energía, nuestras clases" mientras "Próximas clases" carga su contenido. |
| 2 | [02-proximas-clases.png](02-proximas-clases.png) | <ul><li>Encabezado: marca y avatar.</li><li>Saludo "Hola, Laura" y número S-0001, leídos de los datos.</li><li>Selector de día: "Hoy · Mié 7 oct", "Jue 8 oct", "Vie 9 oct".</li><li>Tarjetas con ícono de disciplina, cupos ("2 de 20 cupos") y botón "Reservar".</li><li>Etiqueta "Llena" en Yoga de las 19:00.</li></ul> |
| 3 | [03-detalle-clase.png](03-detalle-clase.png) | Detalle de Spinning, reservado desde el propio detalle:<ul><li>Mensaje "¡Listo! Tu cupo está reservado" dentro del detalle.</li><li>Etiqueta "Reservada" y cupos de 2 a 1.</li><li>Descripción y etiquetas Cardio, Fuerza y Resistencia.</li><li>Botón "Cancelar reserva".</li></ul> |
| 4 | [04-reserva-exitosa.png](04-reserva-exitosa.png) | HU-02 desde la tarjeta: aviso de éxito, Funcional pasa a "Reservada" y los cupos bajan (6 → 5). |
| 5 | [05-rn03-limite-diario.png](05-rn03-limite-diario.png) | RN-03: la tercera reserva del mismo día (Rumba) muestra "Solo puedes reservar 2 clases por día." como aviso de error. Al desplazarse, el selector de día queda fijo arriba. |
| 6 | [06-mis-reservas.png](06-mis-reservas.png) | HU-03: aviso "Puedes cancelar hasta 2 horas antes del inicio." y reservas ordenadas con la etiqueta "Reservada" y el botón "Cancelar reserva". |
| 7 | [07-confirmar-cancelacion.png](07-confirmar-cancelacion.png) | Cancelar pide confirmación ("¿Cancelar esta reserva?"). |
| 8 | [08-cancelacion-confirmada.png](08-cancelacion-confirmada.png) | Al confirmar: "Reserva cancelada. Liberamos tu cupo." y la reserva desaparece. |
| 9 | [09-perfil.png](09-perfil.png) | Perfil con los datos de la socia (Laura Gómez, S-0001), "1 reserva activa" con acceso a "Mis reservas" y la nota de cifrado. No muestra opciones fuera del MVP. |
| 10 | [10-persistencia-tras-reinicio.png](10-persistencia-tras-reinicio.png) | Tras cerrar Expo Go por completo (`am force-stop`) y reabrir, la reserva sigue en "Mis reservas", descifrada con la llave del Keystore. Metro no registró una llave nueva. |
| 11 | [11-rn04-menos-de-2-horas.png](11-rn04-menos-de-2-horas.png) | RN-04: con el reloj del emulador a las 04:30 y Spinning a las 06:00, cancelar muestra "Ya no puedes cancelar: faltan menos de 2 horas." sin pedir confirmación. Después se restauró la hora. |

Notas sobre las capturas:
- **Barra de estado negra:** es de Expo Go, que no dibuja la app detrás de la barra de estado. En el build de la app, el fondo oscuro llega hasta arriba.
- **Botón flotante de herramientas de Expo Go:** se ocultó desde su menú de desarrollo antes de tomar las capturas.

## Build de release (EAS · perfil `preview`) · versión 1.0.0

Estas capturas son del APK de la **versión 1.0.0**, anterior a la mejora visual, y muestran la interfaz clara de esa versión. Se generó en la nube ([build en EAS](https://expo.dev/accounts/nelsonrodriguezc/projects/clasefit/builds/9c7fa5ac-dc0f-4b1b-9538-164065d13496)) y se instaló con `adb install` en el mismo emulador, sin Metro ni Expo Go.

| Captura | Qué demuestra |
|---|---|
| [apk-1.0.0-reserva.png](apk-1.0.0-reserva.png) | El APK de release funciona sin red: lista las clases y reserva ("¡Listo! Tu cupo está reservado", 9 → 8 cupos). |
| [apk-1.0.0-persistencia.png](apk-1.0.0-persistencia.png) | Tras `am force-stop` y reabrir, la reserva sigue en "Mis reservas". |

```
$ aapt dump badging clasefit-preview.apk
package: name='com.keppri.clasefit.nelsonrodriguez' versionCode='1' versionName='1.0.0'
sdkVersion:'24'  targetSdkVersion:'36'  application-label:'ClaseFit'

$ aapt dump permissions clasefit-preview.apk
uses-permission: android.permission.USE_BIOMETRIC      (declarado por expo-secure-store; la app no lo usa)
uses-permission: android.permission.USE_FINGERPRINT    (declarado por expo-secure-store; la app no lo usa)
uses-permission: <paquete>.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION (interno de AndroidX)
→ sin INTERNET, cámara, micrófono ni almacenamiento externo

$ adb shell dumpsys package com.keppri.clasefit.nelsonrodriguez
flags=[ HAS_CODE ALLOW_CLEAR_USER_DATA ]   → sin ALLOW_BACKUP (copias de seguridad deshabilitadas) ni DEBUGGABLE

Almacenamiento de la app (adb root): RKStorage solo contiene el sobre cifrado
{"v":1,"alg":"A256GCM","data":"<base64>"}; no aparecen "Spinning", "Andrés", "S-0001",
"Laura", "2026-10-07" ni "C-05". SecureStore.xml guarda clasefit.dek.v1 cifrada por Android Keystore.
```

## Cifrado en reposo verificado en el dispositivo

Verificación hecha con la versión 1.0.0. En la 1.1.0 no cambió el almacenamiento: la mejora visual no toca el cifrado, y la prueba "Almacenamiento local sin datos legibles" sigue en verde. Con `adb root` (solo emulador) se copiaron la base de datos de AsyncStorage de la experiencia (`RKStorage-scoped-experience-…clasefit…`) y el archivo de SecureStore, y se buscó texto en claro:

```
clasefit.bookings.v1   PRESENT   (clave de almacenamiento)
A256GCM                PRESENT   (sobre {"v":1,"alg":"A256GCM","data":"<base64>"})
Yoga                   absent
Valentina              absent
S-0001                 absent
Laura                  absent
2026-10-07             absent
C-07                   absent
SecureStore.xml contiene la entrada clasefit.dek.v1: true
Llave hex en claro dentro de SecureStore.xml: false (cifrada por Android Keystore)
```

## Defectos encontrados en el dispositivo y corregidos

### Versión 1.0.0
1. **Reservas perdidas al reabrir la app.**
   - **Causa:** en Android, `AESSealedData.fromCombined` de expo-crypto solo acepta bytes, aunque sus tipos permiten una cadena base64 (que sí funciona en iOS y web). El descifrado fallaba, la falla segura descartaba los datos y se registraba `storage.integrity_failure`.
   - **Corrección:** el cifrador solo cruza bytes por la frontera nativa (codec Base64 propio) y el doble de Jest replica la restricción de Android. Tiene prueba de regresión.
2. **Mensaje desactualizado al volver a una pestaña.**
   - **Causa:** el aviso de RN-03 seguía visible después de cancelar en la otra pestaña.
   - **Corrección:** la retroalimentación se limpia cuando la pestaña pierde el foco. Tiene prueba de regresión.

### Versión 1.1.0
3. **La flecha "Volver" del detalle quedaba debajo de la barra de estado.**
   - **Causa:** el modal se dibuja bajo la barra de estado (`statusBarTranslucent`), pero tomaba las medidas de área segura de la ventana principal, que en Expo Go valen 0.
   - **Corrección:** el contenido del modal tiene su propio `SafeAreaProvider`.
   - **Prueba:** se verificó en el emulador. El doble de Jest de `react-native-safe-area-context` devuelve medidas fijas y no permite reproducirlo.
4. **El lema del splash se partía distinto del mockup** ("Tu energía, nuestras / clases").
   - **Corrección:** salto de línea explícito después de la coma.
