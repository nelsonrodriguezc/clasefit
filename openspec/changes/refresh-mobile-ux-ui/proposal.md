# Proposal

## Why

ClaseFit ya resuelve las reservas, pero la experiencia actual no refleja la identidad visual que el producto necesita para el lanzamiento final. Las referencias compartidas muestran un shell móvil más pulido, con jerarquía visual más clara, navegación más rica y estados de la interfaz más expresivos, por lo que conviene actualizar la UX/UI antes de seguir iterando funcionalmente.

## What Changes

- Renovar la identidad visual de la app con una estética oscura, acentos verdes y tarjetas tipo “glass” coherentes con las referencias compartidas.
- Reorganizar el shell móvil para que la experiencia autenticada tenga una navegación más rica y una presentación más cercana al mockup final.
- Introducir pantallas/superficies visuales de apoyo para el flujo: splash branding, detalle de clase y perfil/resumen de la socia.
- Elevar la jerarquía visual de las pantallas existentes de "Próximas clases" y "Mis reservas" con mejor distribución, encabezados, chips, badges y feedback más claro.
- Mantener intactas las reglas funcionales de reservas y cancelación; este cambio no altera RN-01 a RN-04 ni los mensajes del insumo.

## Capabilities

### New Capabilities
- `app-shell`: experiencia móvil visual de ClaseFit, incluyendo splash branding, navegación autenticada, vista de detalle de clase, perfil/resumen de la socia y sistema visual unificado para los flujos principales.

### Modified Capabilities
- Ninguna. Este cambio agrega una capa de experiencia visual sobre el comportamiento funcional existente sin cambiar las reglas del dominio.

## Impact

- Pantallas y componentes en `src/presentation`.
- Tokens visuales, iconografía y composición del tab bar.
- Navegación móvil y superficies auxiliares para detalle/perfil.
- Pruebas de presentación y de aceptación asociadas a los nuevos estados visuales.

## Supuestos

- La referencia compartida define el objetivo visual principal y se tomará como guía de estilo para toda la app autenticada.
- El alcance de este cambio incluye el shell visual nuevo, pero no introduce backend, login, pagos, notificaciones ni administración.
- Cualquier microcopy nuevo que no venga literalmente del insumo funcional se tratará como supuesto y se centralizará para evitar dispersión.

## Fuera de alcance

- Cambiar las reglas de negocio de reservas, cancelación o cupos.
- Cambiar el modelo de datos local, el cifrado o la persistencia de reservas.
- Agregar funcionalidades operativas nuevas como pagos, notificaciones push o panel administrativo.
- Migrar la app a web o alterar el stack base.
