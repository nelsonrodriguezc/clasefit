# Insumo funcional · ClaseFit MVP

*Entregado por: equipo funcional KEPPRI · Para: equipo técnico*

## 1. Contexto

**ClaseFit** es la app de reservas de clases grupales de un gimnasio de barrio en Medellín. Hoy las reservas se hacen por WhatsApp con la recepción, lo que genera sobrecupos y reservas olvidadas.

**Objetivo del MVP:** que el socio vea las próximas clases, reserve y cancele desde el celular.

## 2. Actor

**Socio:** un solo socio ya autenticado ("Laura Gómez"). No hay login.

## 3. Alcance

**Entra:** ver próximas clases · reservar · ver mis reservas · cancelar.
**No entra:** login, pagos, instructores, administración, notificaciones, backend (los datos son locales).

## 4. Historias de usuario

### HU-01 · Ver próximas clases
**Como** socio **quiero** ver las próximas clases **para** decidir a cuál ir.
- Veo las clases de hoy, mañana y pasado mañana, ordenadas por fecha y hora.
- Cada clase muestra: nombre, día, hora, instructor y cupos disponibles (ej. "5 de 20 cupos").
- Las clases que ya empezaron **no** aparecen.
- Si una clase no tiene cupos, se muestra "Llena" y no se puede reservar.

### HU-02 · Reservar una clase
**Como** socio **quiero** reservar una clase **para** asegurar mi cupo.
- Al reservar, el cupo disponible baja en uno y veo "¡Listo! Tu cupo está reservado".
- Aplican RN-01 a RN-03. Si alguna falla, no se reserva y veo el mensaje correspondiente.

### HU-03 · Ver y cancelar mis reservas
**Como** socio **quiero** ver y cancelar mis reservas **para** liberar el cupo si no puedo ir.
- Veo mis reservas ordenadas, la más próxima primero. Si no tengo, veo "Aún no tienes reservas".
- Al cancelar, se pide confirmación; si confirmo, la reserva desaparece y el cupo se libera.
- Aplica RN-04.

## 5. Reglas de negocio

| ID | Regla | Mensaje al usuario |
|---|---|---|
| RN-01 | No se puede reservar una clase sin cupos. | "Esta clase ya no tiene cupos." |
| RN-02 | No se puede reservar la misma clase dos veces. | "Ya reservaste esta clase." |
| RN-03 | Máximo **2 reservas por día** de clase. | "Solo puedes reservar 2 clases por día." |
| RN-04 | Solo se puede cancelar hasta **2 horas antes** del inicio. | "Ya no puedes cancelar: faltan menos de 2 horas." |

## 6. Datos

Usa `mock-data/clases.json`. Cada clase tiene `diaOffset` (0 = hoy, 1 = mañana, 2 = pasado mañana) y `hora`. La fecha real se calcula sumando `diaOffset` a la fecha actual del dispositivo. Las reservas pueden vivir en memoria; persistirlas con AsyncStorage es bonus.

## 7. Supuestos

- Zona horaria: America/Bogota.
- `ocupados` en el JSON son cupos tomados por otros socios; las reservas de Laura se suman.
