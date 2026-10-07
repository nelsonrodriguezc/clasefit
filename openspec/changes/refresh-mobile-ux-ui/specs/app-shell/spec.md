# Spec Delta

## Purpose

Define la experiencia visual y de navegación de ClaseFit según el mockup de referencia (tema oscuro, marca, pestañas, encabezados, tarjetas, detalle y perfil), sin cambiar las reglas de reservas, cancelación ni protección de datos.

## ADDED Requirements

### Requirement: Pantalla de inicio con la marca
Al abrir la app, el sistema SHALL mostrar una pantalla de inicio con fondo oscuro, la marca "ClaseFit" y el lema "Tu energía, nuestras clases" mientras "Próximas clases" carga su contenido. El sistema MUST quitarla cuando ese contenido o su mensaje de error está listo, sin pantallas en blanco intermedias.

#### Scenario: La marca se ve mientras la app carga
- **GIVEN** la app se está abriendo
- **WHEN** "Próximas clases" todavía no tiene su contenido
- **THEN** se ve la pantalla de inicio con "ClaseFit" y "Tu energía, nuestras clases"

#### Scenario: La pantalla de inicio se quita cuando hay contenido
- **GIVEN** la app se está abriendo
- **WHEN** "Próximas clases" termina de cargar las clases
- **THEN** la pantalla de inicio desaparece
- **AND** se ven las tarjetas de las clases

#### Scenario: La pantalla de inicio también se quita si la carga falla
- **GIVEN** el catálogo de clases es inválido
- **WHEN** la app termina de abrir
- **THEN** la pantalla de inicio desaparece
- **AND** se ve "No pudimos cargar las clases."

### Requirement: Pestañas en el orden del mockup
La app SHALL tener tres pestañas, en este orden: "Próximas clases", "Mis reservas" y "Perfil". La pestaña activa MUST indicarse como seleccionada.

#### Scenario: Tres pestañas en orden
- **WHEN** la socia abre la app
- **THEN** ve las pestañas "Próximas clases", "Mis reservas" y "Perfil", en ese orden
- **AND** "Próximas clases" está seleccionada

#### Scenario: Cambiar de pestaña cambia la seleccionada
- **GIVEN** la socia está en "Próximas clases"
- **WHEN** toca "Perfil"
- **THEN** "Perfil" queda seleccionada
- **AND** "Próximas clases" deja de estarlo

### Requirement: Saludo con los datos de la socia
El encabezado de "Próximas clases" SHALL saludar a la socia por su primer nombre ("Hola, Laura") y mostrar su número de socia. Ambos datos MUST tomarse de los datos de la app y no estar escritos en la pantalla.

#### Scenario: Saludo a la socia del insumo
- **GIVEN** la socia de los datos es "Laura Gómez" con número "S-0001"
- **WHEN** abre "Próximas clases"
- **THEN** ve "Hola, Laura" y "S-0001"

#### Scenario: El saludo cambia si cambian los datos
- **GIVEN** la socia de los datos es "Marta Ruiz" con número "S-0042"
- **WHEN** abre "Próximas clases"
- **THEN** ve "Hola, Marta" y "S-0042"

### Requirement: Selector de día
"Próximas clases" SHALL mostrar un botón por cada día que tiene clases: "Hoy" para el día actual y la fecha para los siguientes (por ejemplo "Mié 7 oct"). Tocar un día MUST llevar a las clases de ese día y marcarlo como seleccionado, sin ocultar las clases de los demás días.

#### Scenario: Un botón por cada día con clases
- **GIVEN** son las 10:00 del martes 6 de octubre
- **WHEN** la socia abre "Próximas clases"
- **THEN** ve los botones "Hoy", "Mié 7 oct" y "Jue 8 oct"
- **AND** "Hoy" está seleccionado

#### Scenario: Elegir un día no oculta los demás
- **GIVEN** son las 10:00 del martes 6 de octubre
- **WHEN** la socia toca "Mié 7 oct"
- **THEN** ese botón queda seleccionado
- **AND** siguen visibles las clases de hoy, mañana y pasado mañana

#### Scenario: Sin clases restantes hoy no hay botón "Hoy"
- **GIVEN** son las 20:30 del martes 6 de octubre y todas las clases de hoy ya comenzaron
- **WHEN** la socia abre "Próximas clases"
- **THEN** el primer botón es "Mié 7 oct" y está seleccionado

### Requirement: Tarjetas de clase
Cada clase de "Próximas clases" SHALL mostrarse en una tarjeta con el ícono de su disciplina, nombre, día, hora, duración, instructor y cupos ("6 de 15 cupos"). "Reservada" y "Llena" MUST mostrarse como etiquetas y el botón "Reservar" MUST aparecer solo si la clase se puede reservar.

#### Scenario: Clase con cupos
- **GIVEN** son las 10:00 del martes 6 de octubre
- **WHEN** la socia ve la tarjeta de Funcional de hoy a las 18:00
- **THEN** ve "Funcional", "Hoy · mar 6 oct · 18:00 · 60 min", "Instructor: Camila Ospina", "6 de 15 cupos" y el botón "Reservar"

#### Scenario: Clase llena
- **GIVEN** Yoga de hoy a las 19:00 no tiene cupos
- **WHEN** la socia ve su tarjeta
- **THEN** ve la etiqueta "Llena"
- **AND** no ve el botón "Reservar"

#### Scenario: Clase reservada por la socia
- **GIVEN** la socia reservó Yoga de mañana a las 18:00
- **WHEN** ve su tarjeta
- **THEN** ve la etiqueta "Reservada"
- **AND** no ve el botón "Reservar"

### Requirement: Detalle de clase
Al tocar una tarjeta, el sistema SHALL abrir el detalle de la clase con su día, hora, duración, instructor, cupos, la descripción y las etiquetas de su disciplina. Al volver, "Próximas clases" MUST conservar su estado.

#### Scenario: Abrir el detalle desde una tarjeta
- **GIVEN** son las 10:00 del martes 6 de octubre
- **WHEN** la socia toca la tarjeta de Spinning de mañana a las 06:00
- **THEN** ve el detalle con "Spinning", "Instructor: Andrés Restrepo", "9 de 20 cupos" y "Descripción"
- **AND** ve las etiquetas "Cardio", "Fuerza" y "Resistencia"

#### Scenario: Volver desde el detalle conserva la lista
- **GIVEN** la socia abrió el detalle de una clase
- **WHEN** toca "Volver"
- **THEN** el detalle se cierra
- **AND** la lista de "Próximas clases" sigue igual

### Requirement: Reservar y cancelar desde el detalle
Desde el detalle, la socia SHALL poder reservar una clase disponible o cancelar una clase que reservó, con las mismas reglas, confirmación y mensajes de "Próximas clases" y "Mis reservas". El resultado MUST verse dentro del mismo detalle.

#### Scenario: Reservar desde el detalle
- **GIVEN** la socia abrió el detalle de Yoga de mañana a las 18:00, con 7 de 12 cupos
- **WHEN** toca "Reservar"
- **THEN** en el detalle ve "¡Listo! Tu cupo está reservado", la etiqueta "Reservada" y "6 de 12 cupos"

#### Scenario: Rechazo de una regla desde el detalle
- **GIVEN** la socia ya tiene 2 reservas para mañana
- **WHEN** reserva otra clase de mañana desde su detalle
- **THEN** en el detalle ve "Solo puedes reservar 2 clases por día."

#### Scenario: Cancelar desde el detalle con confirmación
- **GIVEN** la socia reservó Yoga de mañana a las 18:00
- **WHEN** abre su detalle, toca "Cancelar reserva" y confirma
- **THEN** en el detalle ve "Reserva cancelada. Liberamos tu cupo."
- **AND** vuelve a ver el botón "Reservar" y "7 de 12 cupos"

#### Scenario: Cancelar desde el detalle con menos de 2 horas
- **GIVEN** la socia reservó una clase que empieza en 1 hora
- **WHEN** abre su detalle y toca "Cancelar reserva"
- **THEN** ve "Ya no puedes cancelar: faltan menos de 2 horas."
- **AND** no se pide confirmación

### Requirement: Mis reservas con el estilo del mockup
"Mis reservas" SHALL mostrar la regla "Puedes cancelar hasta 2 horas antes del inicio." como aviso informativo cuando hay reservas. Cada reserva MUST verse como tarjeta con el ícono de su disciplina, nombre, la etiqueta "Reservada", día, hora, duración, instructor y el botón "Cancelar reserva".

#### Scenario: Reservas como tarjetas con el aviso de la regla
- **GIVEN** la socia reservó Spinning de mañana a las 06:00
- **WHEN** abre "Mis reservas"
- **THEN** ve el aviso "Puedes cancelar hasta 2 horas antes del inicio."
- **AND** ve la tarjeta de Spinning con "Reservada", "Mañana · mié 7 oct · 06:00 · 45 min", "Instructor: Andrés Restrepo" y el botón "Cancelar reserva"

#### Scenario: Sin reservas no se muestra el aviso
- **GIVEN** la socia no tiene reservas
- **WHEN** abre "Mis reservas"
- **THEN** ve "Aún no tienes reservas"
- **AND** no ve el aviso de la regla de cancelación

### Requirement: Perfil de la socia
La pestaña "Perfil" SHALL mostrar el nombre y el número de la socia y su cantidad de reservas activas, tomados de los datos de la app, y MUST permitir ir a "Mis reservas". El perfil MUST NOT ofrecer opciones de funcionalidades excluidas del MVP, como login, notificaciones o pagos.

#### Scenario: Datos de la socia en el perfil
- **WHEN** la socia abre "Perfil"
- **THEN** ve "Laura Gómez", "S-0001" y "Miembro activo"

#### Scenario: Reservas activas y acceso a Mis reservas
- **GIVEN** la socia tiene 2 reservas activas
- **WHEN** abre "Perfil"
- **THEN** ve "2 reservas activas"
- **AND** al tocar "Mis reservas" llega a esa pantalla

#### Scenario: Sin opciones fuera del alcance
- **WHEN** la socia abre "Perfil"
- **THEN** no ve "Cerrar sesión", "Notificaciones" ni "Pagos"

### Requirement: Retroalimentación unificada
El resultado de reservar o cancelar SHALL mostrarse en un aviso con ícono, el texto literal del insumo y el botón "Cerrar". Los rechazos y errores MUST verse distintos del éxito y anunciarse como alerta.

#### Scenario: Aviso de éxito al reservar
- **WHEN** la socia reserva Yoga de mañana a las 18:00
- **THEN** ve un aviso de éxito con "¡Listo! Tu cupo está reservado" y el botón "Cerrar"

#### Scenario: Aviso de error al incumplir una regla
- **GIVEN** la socia ya tiene 2 reservas para mañana
- **WHEN** intenta reservar otra clase de mañana
- **THEN** ve un aviso de error, anunciado como alerta, con "Solo puedes reservar 2 clases por día."

### Requirement: Contraste del tema oscuro
Cada color de texto del tema oscuro MUST tener un contraste de al menos 4,5:1 (WCAG 2.1 AA) con cada fondo sobre el que se usa.

#### Scenario: Pares de texto y fondo del tema
- **GIVEN** los colores de texto y los fondos del tema oscuro
- **WHEN** se calcula el contraste de cada par que usan las pantallas
- **THEN** todos los pares tienen 4,5:1 o más
