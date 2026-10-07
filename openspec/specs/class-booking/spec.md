# class-booking Specification

## Purpose
Permite a la socia autenticada ver las próximas clases grupales del gimnasio, reservar cupos y ver o cancelar sus reservas desde el celular, aplicando las reglas de negocio RN-01 a RN-04 del insumo funcional.

## Requirements

### Requirement: Listado de próximas clases
El sistema SHALL mostrar en "Próximas clases" las clases de hoy, mañana y pasado mañana que aún no han comenzado, ordenadas por fecha y hora de inicio. La fecha de cada clase MUST calcularse sumando su `diaOffset` a la fecha actual en America/Bogota y tomando su `hora` como hora local de Bogotá.

#### Scenario: Clases de tres días ordenadas por fecha y hora
- **GIVEN** el catálogo tiene clases con `diaOffset` 0, 1 y 2
- **WHEN** la socia abre "Próximas clases" antes de la primera clase del día
- **THEN** ve las clases de hoy, mañana y pasado mañana ordenadas de la más temprana a la más tardía

#### Scenario: Clases que ya comenzaron no aparecen
- **GIVEN** son las 18:30 en Bogotá
- **WHEN** la socia abre "Próximas clases"
- **THEN** no ve las clases de hoy que empezaron a las 18:30 o antes
- **AND** sí ve las clases de hoy que empiezan después de las 18:30

#### Scenario: Clase que comienza en este instante no aparece
- **GIVEN** una clase de hoy empieza a las 19:00
- **WHEN** la socia abre "Próximas clases" a las 19:00 en punto
- **THEN** esa clase no aparece

#### Scenario: Fecha calculada en hora de Bogotá aunque el dispositivo esté en otra zona
- **GIVEN** el dispositivo está configurado en una zona horaria distinta de America/Bogota
- **AND** una clase tiene `diaOffset` 1 y `hora` "18:00"
- **WHEN** se calcula su inicio
- **THEN** su inicio es mañana a las 18:00 hora de Bogotá (23:00 UTC)

#### Scenario: Clases fuera de la ventana de tres días no aparecen
- **GIVEN** el catálogo incluye una clase con `diaOffset` 3
- **WHEN** la socia abre "Próximas clases"
- **THEN** esa clase no aparece

### Requirement: Información de cada clase
Cada clase listada SHALL mostrar su nombre, el día, la hora de inicio, el instructor y los cupos disponibles con el formato "<disponibles> de <total> cupos". Los cupos disponibles MUST ser el cupo total menos los ocupados por otros socios y menos la reserva de la socia en esa sesión, si existe.

#### Scenario: Cupos disponibles descuentan los ocupados por otros socios
- **GIVEN** una clase con `cupoTotal` 20 y `ocupados` 15 que la socia no ha reservado
- **WHEN** se muestra en "Próximas clases"
- **THEN** muestra su nombre, día, hora, instructor y "5 de 20 cupos"

#### Scenario: Cupos disponibles incluyen la reserva de la socia
- **GIVEN** una clase con `cupoTotal` 15 y `ocupados` 9 que la socia ya reservó
- **WHEN** se muestra en "Próximas clases"
- **THEN** muestra "5 de 15 cupos"

### Requirement: Clase llena
Una clase sin cupos disponibles SHALL mostrarse como "Llena" y MUST NOT ofrecer la acción de reservar.

#### Scenario: Clase sin cupos se muestra como Llena
- **GIVEN** una clase con `cupoTotal` 12 y `ocupados` 12
- **WHEN** se muestra en "Próximas clases"
- **THEN** muestra "Llena"
- **AND** la acción de reservar no está disponible

### Requirement: Reservar una clase
El sistema SHALL permitir reservar una clase de "Próximas clases" que cumpla RN-01, RN-02 y RN-03. Al reservar, los cupos disponibles MUST bajar en uno y el sistema MUST mostrar "¡Listo! Tu cupo está reservado".

#### Scenario: Reserva exitosa
- **GIVEN** una clase de mañana con 7 cupos disponibles que la socia no ha reservado
- **AND** la socia no tiene reservas para mañana
- **WHEN** la socia la reserva
- **THEN** se crea la reserva
- **AND** la clase pasa a mostrar 6 cupos disponibles
- **AND** se muestra "¡Listo! Tu cupo está reservado"
- **AND** la reserva aparece en "Mis reservas"

#### Scenario: Reserva de una clase que ya comenzó
- **GIVEN** la socia ve una clase en la lista y esa clase comienza antes de que ella toque reservar
- **WHEN** la socia intenta reservarla
- **THEN** no se crea la reserva
- **AND** se muestra "Esta clase ya no está disponible."

### Requirement: RN-01 · No reservar clases sin cupos
El sistema MUST rechazar la reserva de una clase sin cupos disponibles y mostrar "Esta clase ya no tiene cupos.".

#### Scenario: Reserva rechazada por clase llena
- **GIVEN** una clase con `cupoTotal` 30 y `ocupados` 30
- **WHEN** se solicita reservarla
- **THEN** no se crea la reserva
- **AND** se muestra "Esta clase ya no tiene cupos."
- **AND** los cupos de la clase no cambian

#### Scenario: Reserva del último cupo disponible
- **GIVEN** una clase con `cupoTotal` 15 y `ocupados` 14
- **WHEN** la socia la reserva
- **THEN** se crea la reserva
- **AND** la clase pasa a mostrarse como "Llena"

### Requirement: RN-02 · No reservar la misma clase dos veces
El sistema MUST rechazar una segunda reserva de la misma sesión de clase (misma clase en la misma fecha) y mostrar "Ya reservaste esta clase.".

#### Scenario: Segunda reserva de la misma clase
- **GIVEN** la socia ya reservó la clase de Yoga de mañana a las 18:00
- **WHEN** intenta reservarla otra vez
- **THEN** no se crea otra reserva
- **AND** se muestra "Ya reservaste esta clase."

#### Scenario: Doble toque simultáneo en reservar
- **GIVEN** la socia no ha reservado una clase con cupos
- **WHEN** se envían dos solicitudes de reserva de esa clase al mismo tiempo
- **THEN** se crea una sola reserva
- **AND** la otra solicitud se rechaza con "Ya reservaste esta clase."

### Requirement: RN-03 · Máximo 2 reservas por día de clase
El sistema MUST rechazar una reserva cuando la socia ya tiene 2 reservas para el mismo día calendario de la clase en America/Bogota, y mostrar "Solo puedes reservar 2 clases por día.".

#### Scenario: Tercera reserva del mismo día
- **GIVEN** la socia tiene reservadas Spinning 06:00 y Funcional 07:00 de mañana
- **WHEN** intenta reservar Yoga 18:00 de mañana
- **THEN** no se crea la reserva
- **AND** se muestra "Solo puedes reservar 2 clases por día."

#### Scenario: Reservas en días distintos
- **GIVEN** la socia tiene 2 reservas para hoy
- **WHEN** reserva una clase de mañana con cupos
- **THEN** se crea la reserva

#### Scenario: Solicitudes simultáneas que superarían el límite
- **GIVEN** la socia tiene 1 reserva para mañana
- **WHEN** se envían al mismo tiempo solicitudes de reserva de otras dos clases de mañana
- **THEN** se crea solo una de las dos reservas
- **AND** la otra se rechaza con "Solo puedes reservar 2 clases por día."

#### Scenario: El límite cuenta clases del día que ya comenzaron
- **GIVEN** la socia reservó la clase de hoy de las 06:00, que ya comenzó, y otra clase de hoy
- **WHEN** intenta reservar una tercera clase de hoy
- **THEN** no se crea la reserva
- **AND** se muestra "Solo puedes reservar 2 clases por día."

#### Scenario: Cancelar libera el límite diario
- **GIVEN** la socia tiene 2 reservas para mañana
- **WHEN** cancela una de ellas y reserva otra clase de mañana
- **THEN** se crea la nueva reserva

### Requirement: Ver mis reservas
El sistema SHALL mostrar en "Mis reservas" las reservas de la socia de clases que aún no han comenzado, ordenadas de la más próxima a la más lejana. Si la socia no tiene reservas, el sistema SHALL mostrar "Aún no tienes reservas".

#### Scenario: Reservas ordenadas por proximidad
- **GIVEN** la socia reservó Yoga de pasado mañana a las 09:00 y Spinning de mañana a las 06:00
- **WHEN** abre "Mis reservas"
- **THEN** ve primero Spinning de mañana y después Yoga de pasado mañana

#### Scenario: Reservas de clases ya comenzadas no aparecen
- **GIVEN** la socia reservó la clase de hoy de las 06:00 y ya son las 07:00
- **WHEN** abre "Mis reservas"
- **THEN** esa reserva no aparece

#### Scenario: Sin reservas
- **GIVEN** la socia no tiene reservas
- **WHEN** abre "Mis reservas"
- **THEN** ve "Aún no tienes reservas"

### Requirement: Cancelar una reserva con confirmación
El sistema SHALL pedir confirmación antes de cancelar una reserva. Al confirmar, la reserva MUST desaparecer de "Mis reservas", su cupo MUST liberarse y el sistema MUST mostrar "Reserva cancelada. Liberamos tu cupo.".

#### Scenario: Cancelación confirmada
- **GIVEN** la socia tiene una reserva de una clase que empieza en más de 2 horas
- **WHEN** toca cancelar y confirma
- **THEN** la reserva desaparece de "Mis reservas"
- **AND** los cupos disponibles de esa clase suben en uno en "Próximas clases"
- **AND** se muestra "Reserva cancelada. Liberamos tu cupo."

#### Scenario: Cancelación desistida
- **GIVEN** la socia tiene una reserva de una clase que empieza en más de 2 horas
- **WHEN** toca cancelar y no confirma
- **THEN** la reserva se mantiene en "Mis reservas"

### Requirement: RN-04 · Cancelar solo hasta 2 horas antes
El sistema MUST permitir cancelar una reserva solo si faltan 2 horas o más para el inicio de la clase. Si faltan menos de 2 horas MUST rechazar la cancelación, conservar la reserva y mostrar "Ya no puedes cancelar: faltan menos de 2 horas.".

#### Scenario: Cancelación con más de 2 horas de anticipación
- **GIVEN** una reserva de una clase que empieza en 3 horas
- **WHEN** la socia la cancela y confirma
- **THEN** la reserva se elimina

#### Scenario: Cancelación exactamente 2 horas antes
- **GIVEN** una reserva de una clase que empieza en exactamente 2 horas
- **WHEN** la socia la cancela y confirma
- **THEN** la reserva se elimina

#### Scenario: Cancelación con menos de 2 horas
- **GIVEN** una reserva de una clase que empieza en 1 hora y 59 minutos
- **WHEN** la socia intenta cancelarla
- **THEN** la reserva se conserva
- **AND** se muestra "Ya no puedes cancelar: faltan menos de 2 horas."
- **AND** no se pide confirmación

#### Scenario: El plazo vence mientras se confirma
- **GIVEN** la socia abrió la confirmación cuando faltaban más de 2 horas
- **WHEN** confirma cuando ya faltan menos de 2 horas
- **THEN** la reserva se conserva
- **AND** se muestra "Ya no puedes cancelar: faltan menos de 2 horas."

### Requirement: Prioridad de mensajes cuando fallan varias reglas
Cuando una reserva incumple varias reglas a la vez, el sistema SHALL mostrar un único mensaje con esta prioridad: RN-02, luego RN-01 y luego RN-03.

#### Scenario: Clase ya reservada y sin cupos
- **GIVEN** la socia reservó el último cupo de una clase
- **WHEN** intenta reservarla otra vez
- **THEN** se muestra "Ya reservaste esta clase."

#### Scenario: Clase sin cupos con el límite diario alcanzado
- **GIVEN** la socia tiene 2 reservas para mañana
- **WHEN** intenta reservar una clase llena de mañana
- **THEN** se muestra "Esta clase ya no tiene cupos."

### Requirement: Catálogo de clases válido
El sistema MUST validar la estructura del catálogo de clases antes de usarlo. Si el catálogo es inválido, el sistema MUST NOT mostrar clases y SHALL mostrar "No pudimos cargar las clases.".

#### Scenario: Catálogo del insumo aceptado
- **GIVEN** el catálogo entregado por el equipo funcional con 10 clases
- **WHEN** la app lo carga
- **THEN** acepta las 10 clases

#### Scenario: Catálogo con estructura inválida
- **GIVEN** el catálogo tiene una clase sin instructor o con una hora fuera del formato HH:mm
- **WHEN** la socia abre "Próximas clases"
- **THEN** no ve clases
- **AND** ve "No pudimos cargar las clases."

#### Scenario: Catálogo con más ocupados que cupos
- **GIVEN** el catálogo tiene una clase con `ocupados` mayor que `cupoTotal`
- **WHEN** la socia abre "Próximas clases"
- **THEN** ve "No pudimos cargar las clases."
