# Evidencias · smoke test en Android

Dispositivo: emulador Android **Pixel 7 · API 33** (imagen `google_apis`), app ejecutada en **Expo Go (SDK 57)** con `npx expo start`. Hora del dispositivo: America/Bogota.

| # | Captura | Qué demuestra |
|---|---|---|
| 1 | [01-proximas-clases.png](01-proximas-clases.png) | A las 20:34 las clases de hoy ya comenzaron y no aparecen; cada tarjeta muestra nombre, día, hora, duración, instructor y cupos ("9 de 20 cupos"); Rumba 19:00 aparece como "Llena". |
| 2 | [02-reserva-exitosa.png](02-reserva-exitosa.png) | HU-02: "¡Listo! Tu cupo está reservado", la clase queda "Reservada" y el cupo baja (9 → 8). |
| 3 | [03-rn03-limite-diario.png](03-rn03-limite-diario.png) | RN-01/RN-03: Funcional (último cupo) pasa a "Llena"; la tercera reserva del mismo día muestra "Solo puedes reservar 2 clases por día.". |
| 4 | [04-mis-reservas.png](04-mis-reservas.png) | HU-03: reservas ordenadas de la más próxima a la más lejana. |
| 5 | [05-confirmar-cancelacion.png](05-confirmar-cancelacion.png) | Cancelar pide confirmación ("¿Cancelar esta reserva?"). |
| 6 | [06-cancelacion-confirmada.png](06-cancelacion-confirmada.png) | Al confirmar: "Reserva cancelada. Liberamos tu cupo." y la reserva desaparece; en "Próximas clases" el cupo vuelve (8 → 9). |
| 7 | [07-persistencia-tras-reinicio.png](07-persistencia-tras-reinicio.png) | Tras cerrar Expo Go por completo (`am force-stop`) y reabrir, la reserva sigue en "Mis reservas" (descifrada con la llave del Keystore). |
| 8 | [08-rn04-menos-de-2-horas.png](08-rn04-menos-de-2-horas.png) | RN-04: con el reloj del emulador a las 16:30 y la clase a las 18:00, cancelar muestra "Ya no puedes cancelar: faltan menos de 2 horas." sin pedir confirmación. |

## Build de release (EAS · perfil `preview`)

APK generado en la nube ([build en EAS](https://expo.dev/accounts/nelsonrodriguezc/projects/clasefit/builds/9c7fa5ac-dc0f-4b1b-9538-164065d13496)) e instalado con `adb install` en el mismo emulador, sin Metro ni Expo Go.

| # | Captura | Qué demuestra |
|---|---|---|
| 9 | [09-apk-release-reserva.png](09-apk-release-reserva.png) | El APK de release funciona sin red: lista las clases y reserva ("¡Listo! Tu cupo está reservado", 9 → 8 cupos). |
| 10 | [10-apk-release-persistencia.png](10-apk-release-persistencia.png) | Tras `am force-stop` y reabrir, la reserva sigue en "Mis reservas". |

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

Con `adb root` (solo emulador) se copiaron la base de datos de AsyncStorage de la experiencia (`RKStorage-scoped-experience-…clasefit…`) y el archivo de SecureStore, y se buscó texto en claro:

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

## Defectos encontrados en el dispositivo (y corregidos con prueba de regresión)

1. **Reservas perdidas al reabrir la app.** En Android, `AESSealedData.fromCombined` de expo-crypto solo acepta bytes, aunque sus tipos permiten una cadena base64 (que sí funciona en iOS y web). El descifrado fallaba, la falla segura descartaba los datos y se registraba `storage.integrity_failure`. Corrección: el cifrador solo cruza bytes por la frontera nativa (codec Base64 propio) y el doble de Jest replica la restricción de Android.
2. **Mensaje desactualizado al volver a una pestaña.** El aviso de RN-03 seguía visible después de cancelar en la otra pestaña. Corrección: la retroalimentación se limpia cuando la pestaña pierde el foco.
