# Proposal

## Why

ClaseFit ya resuelve las reservas, pero su interfaz no refleja la identidad visual del mockup de referencia (tema oscuro, acentos verdes, tarjetas con íconos, splash con la marca). Además, la revisión de la primera versión de este cambio contra el mockup y las reglas del proyecto encontró desajustes. Había datos de la socia escritos en la pantalla, el orden de las pestañas no era el del mockup, la paleta no coincidía, había textos fuera de `messages.ts` y opciones fuera del alcance del MVP. También el resultado de reservar desde el detalle quedaba oculto y una prueba de escenario no probaba nada.

## What Changes

- Tema oscuro con la paleta exacta del mockup y contraste AA verificado por prueba.
- Pestañas en el orden del mockup ("Próximas clases", "Mis reservas", "Perfil") con encabezados propios.
- "Próximas clases" con saludo y número de socia tomados de los datos, selector de día que lleva a la sección del día sin ocultar las demás, y tarjetas con ícono de disciplina, etiquetas "Reservada"/"Llena" y botón "Reservar".
- Detalle de clase con descripción y etiquetas de la disciplina, desde el que se puede reservar o cancelar con las mismas reglas, confirmación y mensajes; el resultado se ve en el mismo detalle.
- "Mis reservas" con la regla de cancelación como aviso informativo y tarjetas con "Cancelar reserva".
- "Perfil" con los datos reales de la socia, sus reservas activas y acceso a "Mis reservas".
- Splash nativo y splash de la app con la marca; ícono de la app con la marca de ClaseFit.
- Sin cambios en RN-01 a RN-04, en los mensajes del insumo ni en el cifrado de las reservas.

## Capabilities

### New Capabilities
- `app-shell`: experiencia visual y de navegación de ClaseFit: arranque con la marca, pestañas, encabezados con los datos de la socia, selector de día, tarjetas, detalle de clase, perfil, retroalimentación unificada y contraste del tema oscuro.

### Modified Capabilities
- Ninguna. Las reglas de `class-booking` y `booking-data-protection` no cambian; el detalle reutiliza los mismos casos de uso para reservar y cancelar.

## Impact

- `src/presentation`: tema, primitivas visuales, pantallas, navegación y textos.
- `src/application`: caso de uso de solo lectura para el perfil de la socia y el id de la reserva en la vista de cada clase (necesario para cancelar desde el detalle).
- `src/domain`: función pura para encontrar la reserva de la socia en una sesión.
- `assets/` y `app.json`: marca, ícono, ícono adaptativo y splash nativo.
- Dependencia nueva: `expo-splash-screen` (paquete oficial del SDK 57) para configurar el splash nativo.
- Pruebas de aceptación por escenario de `app-shell`, prueba de contraste y pruebas de la nueva lógica.

## Supuestos

- **UI-1:** El mockup es la referencia visual. Donde contradice el insumo o el alcance del MVP, manda el insumo.
- **UI-2:** No hay fotografías con licencia, así que cada disciplina usa un ícono en lugar de foto.
- **UI-3:** Las descripciones y etiquetas de cada disciplina son textos de demostración, no vienen del insumo. La de Spinning toma el texto del mockup.
- **UI-4:** Se conservan los textos del insumo cuando el mockup muestra otros. Por ejemplo, el éxito de una reserva sigue siendo "¡Listo! Tu cupo está reservado" y no "Reserva realizada con éxito".
- **UI-5:** Los botones verdes llevan texto oscuro y no blanco: el blanco sobre `#22C55E` tiene contraste 2,3:1 y no cumple AA.
- **UI-6:** El selector de día no filtra la lista, porque HU-01 exige ver las clases de los tres días al abrir la pantalla. Elegir un día lleva a su sección.
- **UI-7:** "Miembro activo" es una etiqueta visual; el insumo no define estados de membresía.

## Fuera de alcance

- Elementos del mockup que requieren funcionalidades excluidas por el insumo: campana de notificaciones, compartir, ajustes, "Historial de clases", "Datos de la cuenta", "Notificaciones", "Ayuda y soporte", "Cerrar sesión" y "Ver todas".
- Cambiar las reglas de negocio, el modelo de datos guardado o el cifrado.
- Backend, login, pagos o notificaciones push.
