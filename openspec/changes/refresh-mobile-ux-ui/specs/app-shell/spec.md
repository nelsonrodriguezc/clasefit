# Spec Delta

## Purpose

Define la experiencia visual y de navegación autenticada de ClaseFit para que la app coincida con la referencia compartida sin alterar las reglas funcionales de reservas, cancelación ni persistencia.

## ADDED Requirements

### Requirement: Splash branding
El sistema SHALL mostrar una pantalla de inicio con la identidad visual de ClaseFit antes de revelar la experiencia autenticada.

#### Scenario: Inicio muestra branding
- **GIVEN** la app se abre en un dispositivo móvil
- **WHEN** todavía no está visible la experiencia principal
- **THEN** la pantalla de inicio muestra el branding de ClaseFit con tratamiento visual oscuro y centrado

#### Scenario: La app termina de iniciar sin parpadeo
- **GIVEN** la app ya cargó sus dependencias locales
- **WHEN** finaliza el arranque
- **THEN** la experiencia autenticada aparece sin mostrar una pantalla vacía intermedia

### Requirement: Shell autenticado consistente
La experiencia autenticada SHALL presentar un shell móvil consistente con navegación inferior y estados activos claros para "Próximas clases" y "Mis reservas", además de una superficie de perfil accesible dentro del mismo shell.

#### Scenario: Navegación principal visible
- **GIVEN** la socia ya está dentro de la app
- **WHEN** se muestra la experiencia principal
- **THEN** puede identificar las secciones "Próximas clases" y "Mis reservas" en la navegación

#### Scenario: Superficie de perfil accesible
- **GIVEN** la socia está en el shell autenticado
- **WHEN** cambia a la superficie de perfil
- **THEN** ve un resumen visual de su cuenta dentro del mismo shell

### Requirement: Presentación visual de "Próximas clases"
La pantalla de "Próximas clases" SHALL usar una jerarquía visual más rica que destaque saludo, estado de la agenda, chips de fecha, tarjetas de clase y disponibilidad, manteniendo intactos los textos funcionales ya definidos.

#### Scenario: La pantalla muestra la agenda con identidad visual renovada
- **GIVEN** existen clases disponibles para hoy, mañana o pasado mañana
- **WHEN** la socia abre "Próximas clases"
- **THEN** ve un encabezado visual coherente con la referencia y una lista de tarjetas claramente diferenciadas

#### Scenario: Los estados funcionales siguen presentes
- **GIVEN** una clase está reservada, llena o disponible
- **WHEN** se muestra la tarjeta
- **THEN** la tarjeta conserva su estado funcional visible sin alterar los mensajes del insumo

### Requirement: Superficie de detalle de clase
El sistema SHALL permitir abrir una superficie de detalle para una clase desde la vista de "Próximas clases" y mostrar allí la información resumida relevante para decidir la reserva.

#### Scenario: Abrir el detalle desde una clase
- **GIVEN** la socia ve una clase en "Próximas clases"
- **WHEN** selecciona esa clase
- **THEN** se abre una superficie de detalle con el resumen de la clase

#### Scenario: Volver desde el detalle no altera la clase
- **GIVEN** la socia abrió el detalle de una clase
- **WHEN** regresa a "Próximas clases"
- **THEN** la lista conserva su estado visual y funcional

### Requirement: Presentación visual de "Mis reservas"
La pantalla de "Mis reservas" SHALL reflejar la misma identidad visual del resto de la app y seguir mostrando las reservas ordenadas, con acciones de cancelación claramente distinguibles.

#### Scenario: Reservas visibles con el nuevo estilo
- **GIVEN** la socia tiene reservas activas
- **WHEN** abre "Mis reservas"
- **THEN** las reservas aparecen como tarjetas consistentes con la referencia visual

#### Scenario: Estado vacío mantiene el mensaje funcional
- **GIVEN** la socia no tiene reservas
- **WHEN** abre "Mis reservas"
- **THEN** se muestra "Aún no tienes reservas"

### Requirement: Feedback visual unificado
Los resultados de reservar, cancelar, cargar y fallar SHALL mostrarse con un lenguaje visual unificado y accesible, sin cambiar los mensajes funcionales citados en el insumo.

#### Scenario: Reserva exitosa usa el feedback correcto
- **GIVEN** la socia reserva una clase con éxito
- **WHEN** el sistema confirma la acción
- **THEN** muestra "¡Listo! Tu cupo está reservado" con un feedback visual claramente exitoso

#### Scenario: Error visible y legible
- **GIVEN** ocurre un error al cargar o guardar
- **WHEN** el sistema informa el fallo
- **THEN** el mensaje aparece como feedback de error legible y diferenciado
