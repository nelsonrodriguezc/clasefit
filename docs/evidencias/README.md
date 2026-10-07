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
