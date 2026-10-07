# Spec Delta

## Purpose

Protege las reservas de la socia guardadas en el dispositivo: persistencia entre sesiones con cifrado autenticado, custodia de la llave en el almacén seguro del sistema operativo, falla segura, minimización de datos y registros sin información personal.

## ADDED Requirements

### Requirement: Persistencia cifrada de reservas
El sistema SHALL conservar las reservas de la socia al cerrar y volver a abrir la app en el mismo dispositivo, y MUST guardarlas únicamente con cifrado autenticado, de modo que el almacenamiento local no contenga datos de reservas legibles.

#### Scenario: Reabrir la app conserva las reservas
- **GIVEN** la socia reservó una clase
- **WHEN** cierra la app y la vuelve a abrir
- **THEN** la reserva sigue en "Mis reservas"

#### Scenario: Almacenamiento local sin datos legibles
- **GIVEN** la socia tiene reservas guardadas
- **WHEN** se inspecciona el almacenamiento local de la app
- **THEN** no aparecen en claro nombres de clases, instructores, identificadores de clase o de socia ni fechas de reserva

#### Scenario: Mismo contenido guardado dos veces produce cifrados distintos
- **GIVEN** la app guarda dos veces exactamente las mismas reservas
- **WHEN** se comparan los dos contenidos cifrados
- **THEN** son distintos

### Requirement: Custodia de la llave de cifrado
La llave de cifrado MUST ser de 256 bits, generarse aleatoriamente en el dispositivo en el primer uso y guardarse solo en el almacén seguro del sistema operativo, accesible únicamente con el dispositivo desbloqueado y sin migrar a otros dispositivos. Los datos de la app MUST quedar excluidos de las copias de seguridad automáticas.

#### Scenario: Primera ejecución genera la llave
- **GIVEN** no existe una llave en el almacén seguro
- **WHEN** la app guarda reservas por primera vez
- **THEN** genera una llave aleatoria de 256 bits
- **AND** la guarda en el almacén seguro con acceso solo con el dispositivo desbloqueado y solo en este dispositivo

#### Scenario: Ejecuciones siguientes reutilizan la llave
- **GIVEN** ya existe una llave en el almacén seguro
- **WHEN** la app vuelve a leer o guardar reservas
- **THEN** usa la misma llave sin generar otra

#### Scenario: Copias de seguridad automáticas excluidas
- **GIVEN** la app está instalada en Android
- **WHEN** el sistema hace una copia de seguridad automática
- **THEN** los datos de la app no se incluyen

### Requirement: Integridad y falla segura al leer
Si las reservas guardadas fueron alteradas, están corruptas, tienen una versión de formato desconocida o no pueden descifrarse, el sistema MUST descartarlas sin mostrarlas, eliminarlas del almacenamiento y continuar con la lista de reservas vacía.

#### Scenario: Datos cifrados alterados
- **GIVEN** el contenido cifrado guardado fue modificado fuera de la app
- **WHEN** la app carga las reservas
- **THEN** no muestra reservas
- **AND** elimina el contenido alterado del almacenamiento

#### Scenario: Llave ausente con datos guardados
- **GIVEN** existen reservas cifradas pero la llave ya no está en el almacén seguro
- **WHEN** la app carga las reservas
- **THEN** no muestra reservas
- **AND** elimina el contenido ilegible del almacenamiento

#### Scenario: Formato de almacenamiento desconocido
- **GIVEN** el almacenamiento contiene datos con una versión de formato no soportada
- **WHEN** la app carga las reservas
- **THEN** no muestra reservas
- **AND** elimina esos datos del almacenamiento

#### Scenario: Contenido descifrado con estructura inválida
- **GIVEN** el contenido se descifra correctamente pero no tiene la estructura de una lista de reservas
- **WHEN** la app carga las reservas
- **THEN** no muestra reservas
- **AND** elimina esos datos del almacenamiento

### Requirement: Falla segura al guardar
Si una reserva o una cancelación no puede cifrarse o guardarse, el sistema MUST NOT aplicar el cambio, MUST NOT escribir datos sin cifrar y SHALL mostrar "No pudimos completar la acción. Intenta de nuevo.".

#### Scenario: Error al guardar una reserva
- **GIVEN** el almacén seguro no está disponible
- **WHEN** la socia intenta reservar una clase
- **THEN** no se crea la reserva
- **AND** se muestra "No pudimos completar la acción. Intenta de nuevo."
- **AND** no se escribe ningún dato sin cifrar

#### Scenario: Error al guardar una cancelación
- **GIVEN** el almacenamiento no permite guardar cambios
- **WHEN** la socia confirma la cancelación de una reserva
- **THEN** la reserva se conserva
- **AND** se muestra "No pudimos completar la acción. Intenta de nuevo."

### Requirement: Minimización y retención de datos
El sistema SHALL guardar por cada reserva solo los datos necesarios para mostrarla y aplicar las reglas, sin el nombre de la socia, y MUST eliminar al abrir la app las reservas de clases de días anteriores al actual en America/Bogota.

#### Scenario: Reserva guardada sin el nombre de la socia
- **GIVEN** la socia reserva una clase
- **WHEN** se guarda la reserva
- **THEN** el contenido guardado no incluye el nombre de la socia

#### Scenario: Reservas de días anteriores se eliminan
- **GIVEN** la socia tiene una reserva de una clase de ayer y otra de mañana
- **WHEN** abre la app
- **THEN** la reserva de ayer se elimina del almacenamiento
- **AND** la reserva de mañana se conserva

### Requirement: Registros sin datos personales
Los registros técnicos MUST identificar los eventos solo con códigos y MUST NOT incluir datos personales ni contenido de reservas. En compilaciones de producción MUST NOT escribirse en la consola.

#### Scenario: Error de integridad registrado sin datos personales
- **GIVEN** las reservas guardadas fueron alteradas
- **WHEN** la app las descarta
- **THEN** registra un evento con un código de integridad
- **AND** el registro no contiene nombres, identificadores ni fechas de reservas

#### Scenario: Registros silenciados en producción
- **GIVEN** la app corre en una compilación de producción
- **WHEN** ocurre un evento técnico
- **THEN** no se escribe nada en la consola
