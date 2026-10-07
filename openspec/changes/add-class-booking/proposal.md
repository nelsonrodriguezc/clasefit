# Proposal · add-class-booking

## Why

Hoy las reservas de clases del gimnasio ClaseFit (Sede Laureles, Medellín) se hacen por WhatsApp con la recepción, lo que genera sobrecupos y reservas olvidadas. El MVP permite que la socia vea las próximas clases, reserve y cancele desde el celular aplicando las reglas RN-01 a RN-04, con sus reservas protegidas en el dispositivo como lo haría una app financiera.

## What Changes

- Pantalla **Próximas clases**: clases de hoy, mañana y pasado mañana (hora de Bogotá), ordenadas por fecha y hora, con nombre, día, hora, instructor y cupos disponibles ("5 de 20 cupos"); las clases iniciadas no aparecen y las clases sin cupo se muestran como "Llena".
- Acción **Reservar** con las reglas RN-01 (sin cupos), RN-02 (sin duplicados) y RN-03 (máximo 2 reservas por día), mensajes literales del insumo y confirmación "¡Listo! Tu cupo está reservado".
- Pantalla **Mis reservas** ordenada por proximidad, con estado vacío "Aún no tienes reservas" y **Cancelar** con confirmación y la regla RN-04 (hasta 2 horas antes).
- **Persistencia segura** de reservas entre sesiones: cifrado autenticado en reposo, llave solo en el almacén seguro del sistema operativo, falla segura ante datos alterados, minimización y retención de datos.
- Validación del catálogo de clases empaquetado antes de usarlo.

## Capabilities

### New Capabilities
- `class-booking`: consulta de próximas clases, reserva y cancelación de cupos por la socia, con las reglas de negocio RN-01 a RN-04 y sus mensajes.
- `booking-data-protection`: protección de las reservas guardadas en el dispositivo (persistencia cifrada, custodia de la llave, integridad, falla segura, minimización y registros sin datos personales).

### Modified Capabilities
- Ninguna (no existen specs previas en `openspec/specs/`).

## Impact

- **Código nuevo:** `app/` (rutas y pestañas), `src/domain`, `src/application`, `src/infrastructure`, `src/presentation`, `src/di` y pruebas en `__tests__/`.
- **Dependencias nuevas:** expo-router (con react-native-safe-area-context, react-native-screens, expo-linking, expo-constants), expo-secure-store, expo-crypto, @react-native-async-storage/async-storage, @expo/vector-icons y zod. Se justifican en `design.md`.
- **Configuración:** punto de entrada `expo-router/entry` y `android.allowBackup: false` en `app.json`.
- **Sistemas externos:** ninguno; no hay backend ni red.

## Trazabilidad insumo → spec

| Insumo | Requisito |
|---|---|
| HU-01 | `class-booking`: Listado de próximas clases · Información de cada clase · Clase llena · Catálogo de clases válido |
| HU-02 | `class-booking`: Reservar una clase · Prioridad de mensajes cuando fallan varias reglas |
| HU-03 | `class-booking`: Ver mis reservas · Cancelar una reserva con confirmación |
| RN-01 | `class-booking`: RN-01 · No reservar clases sin cupos |
| RN-02 | `class-booking`: RN-02 · No reservar la misma clase dos veces |
| RN-03 | `class-booking`: RN-03 · Máximo 2 reservas por día de clase |
| RN-04 | `class-booking`: RN-04 · Cancelar solo hasta 2 horas antes |
| §6 Datos (AsyncStorage) + pedido de seguridad | `booking-data-protection`: todos sus requisitos |

## Supuestos

| # | Supuesto | Motivo |
|---|---|---|
| S1 | RN-04 permite cancelar cuando faltan **2 horas o más**; con exactamente 2 h se permite. | El insumo dice "hasta 2 horas antes" y el mensaje "faltan **menos** de 2 horas". La guía metodológica usa un ejemplo con "2 horas o menos → no permite"; se sigue el insumo y se registra la discrepancia para el PO. |
| S2 | Una clase "ya empezó" cuando su hora de inicio es igual o anterior al momento actual. | HU-01: las clases que ya empezaron no aparecen. |
| S3 | "Hoy" es la fecha actual en America/Bogota (UTC−5, sin horario de verano), aunque el dispositivo esté en otra zona. | Insumo §6 y §7. |
| S4 | Una reserva corresponde a la **sesión** de una clase (clase + fecha) y conserva sus datos (nombre, instructor, inicio, duración). | `diaOffset` es relativo al día actual: al día siguiente la misma clase del JSON cae en otra fecha. |
| S5 | RN-03 cuenta las reservas por día calendario de la clase, incluidas las de clases de ese día que ya comenzaron. | "Máximo 2 reservas por día de clase". |
| S6 | Mis reservas muestra solo reservas de clases que aún no comienzan; las de días anteriores se eliminan al abrir la app. | HU-03 habla de reservas próximas; minimización de datos. |
| S7 | Si fallan varias reglas a la vez se muestra un solo mensaje, con prioridad RN-02 > RN-01 > RN-03. | El insumo no define prioridad; se elige el mensaje más específico. |
| S8 | Cupos disponibles = `cupoTotal` − `ocupados` − (1 si la socia reservó esa sesión). | Insumo §7: las reservas de Laura se suman a `ocupados`. |
| S9 | Textos nuevos: "Esta clase ya no está disponible.", "Reserva cancelada. Liberamos tu cupo.", "No pudimos completar la acción. Intenta de nuevo." y "No pudimos cargar las clases." | El insumo no define esos casos. |

## Fuera de alcance

- Login, pagos, instructores, administración, notificaciones y backend (insumo §3).
- Bloqueo biométrico de la app (el insumo indica que no hay login).
- Bloqueo de capturas de pantalla: cambia la experiencia y requiere decisión de producto.
- Certificate pinning, attestation y detección de root/jailbreak: no hay comunicación con servidores en este MVP.
- Versión web de la app.
