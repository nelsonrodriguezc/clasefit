# Design

## Context

Ver [proposal.md](./proposal.md). La app ya sigue arquitectura limpia: las reglas viven en `src/domain`, los casos de uso en `src/application` y la UI en `src/presentation`, que solo conoce interfaces de casos de uso (ESLint lo impide de otra forma). El cambio es casi todo de presentación. La revisión de la primera versión contra el mockup y contra `CLAUDE.md` dejó estos hallazgos, que este diseño corrige:

| Hallazgo de la revisión | Corrección |
|---|---|
| "Laura", "Laura Gómez" y "S-0001" escritos en las pantallas | Caso de uso de solo lectura `GetMemberProfile` (D1) |
| Pestañas en orden Próximas · Perfil · Mis reservas | Orden del mockup: Próximas · Mis reservas · Perfil (D3) |
| Paleta distinta a la del mockup (`#081220`, `#0B1B2C`, `#A8B8C8`) | Tokens exactos del mockup y prueba de contraste (D2) |
| `StatusBar` oscura sobre fondo oscuro y tema claro de React Navigation | Barra clara y tema oscuro de navegación (D3) |
| Textos nuevos dentro de los componentes | Todos en `messages.ts` (D9) |
| Perfil con "Notificaciones" y "Ayuda y soporte" sin acción (notificaciones están fuera del alcance) | Perfil solo con datos reales y acceso a "Mis reservas" (D10) |
| El detalle guardaba una copia de la clase: tras reservar no se actualizaba y el mensaje quedaba detrás del modal | El detalle lee la clase viva y muestra el aviso dentro (D4) |
| La misma descripción ("alta intensidad") para Yoga, Rumba y Spinning | Descripción y etiquetas por disciplina (D8) |
| Chips de día sin acción | Selector de día que lleva a la sección del día (D6) |
| La prueba del escenario "Error visible y legible" no provocaba ningún error | Pruebas reescritas desde escenarios concretos |

## Goals / Non-Goals

**Goals:**
- Que la app se vea como el mockup dentro del alcance del MVP.
- Mantener intactas las reglas RN-01 a RN-04, los mensajes del insumo y la protección de datos.
- Que cada escenario de `app-shell` tenga su prueba de aceptación con el mismo nombre.

**Non-Goals:**
- Funcionalidades del mockup excluidas por el insumo (notificaciones, login, historial, ajustes).
- Fotografías, animaciones complejas o librerías de UI nuevas.

## Decisions

### D1. Datos de la socia por un caso de uso de solo lectura
La UI solo puede usar casos de uso, así que se agrega `GetMemberProfile`, que lee el puerto `MemberSession` y devuelve `{ id, name }`. Si los datos son inválidos, registra `member.read_failed` (sin datos personales) y devuelve `UNEXPECTED`. La vista `UpcomingClass` suma `bookingId` (la reserva de la socia en esa sesión, o `null`) para cancelar desde el detalle, y el dominio gana la función pura `bookingOf`; `isBookedBy` se define con ella. Las reglas y los casos de uso existentes no cambian.

**Alternativas descartadas:** leer el JSON desde la pantalla (rompe la inversión de dependencias); buscar la reserva en "Mis reservas" desde el detalle (acopla dos pantallas).

### D2. Paleta del mockup con contraste verificado
Los tokens base son los del mockup: fondo `#0B1220`, superficie `#1A2332`, verde `#22C55E`, verde claro `#86EFAC`, verde oscuro `#065F46`, texto `#F8FAFC`, texto secundario `#94A3B8` y error `#EF4444`. Los tokens derivados (superficies de avisos, texto de error `#F87171`, rojo de botón `#B91C1C`) existen para cumplir contraste. Una prueba calcula el contraste WCAG de cada par texto/fondo. Los botones verdes usan texto oscuro: el blanco sobre `#22C55E` da 2,3:1.

### D3. Navegación con encabezados propios
Las pestañas siguen el orden del mockup. Las pantallas dibujan su propio encabezado (marca, avatar) respetando el área segura, por lo que el encabezado del navegador se oculta. `NavigationContainer` usa un tema oscuro basado en `DarkTheme` y la barra de estado usa íconos claros.

### D4. Detalle como modal de pantalla completa que lee la clase viva
El detalle es un `Modal` dentro de "Próximas clases", no una pila de navegación. Así no se suma `@react-navigation/native-stack` y la lista conserva su estado. El modal recibe el `sessionId` y toma la clase del estado actual del view-model, así se actualiza tras reservar o cancelar y se cierra solo si la clase deja de estar disponible. El aviso del resultado se muestra dentro del modal. El botón atrás de Android cierra el modal (`onRequestClose`).

### D5. Un solo flujo de cancelación
El flujo verificar → confirmar → cancelar (RN-04 se valida dos veces) se extrae al hook `useCancellation`, que usan "Mis reservas" y el detalle. No se duplica la lógica de confirmación ni los mensajes.

### D6. Selector de día como navegación, no como filtro
HU-01 exige ver las clases de los tres días al abrir la pantalla, así que el selector no filtra. Lleva a la sección del día y se resalta según el desplazamiento. Las secciones se agrupan por `daysFromToday`, que ya calcula el caso de uso.

### D7. Splash nativo y splash de la app
El splash nativo usa `expo-splash-screen` con fondo `#0B1220` y la marca, y evita el fondo blanco de Android antes del primer render. Es la única dependencia nueva: es el paquete oficial del SDK 57 para configurar el splash nativo y no agrega código en tiempo de ejecución. Sobre la app, `BrandSplash` muestra la marca, el nombre y el lema hasta que "Próximas clases" avisa que tiene contenido o error, con un tiempo máximo de 3 s para no bloquear la app si el aviso no llega. No hay demoras artificiales.

### D8. Marca e íconos
- **Marca:** se dibuja en un SVG fuente (`assets/brand/clasefit-mark.svg`) y se exporta a PNG para la app, el ícono, el ícono adaptativo y el splash.
- **Exportación:** la hace `scripts/export-brand-assets.ps1`. El script lee los trazos y el degradado del SVG y dibuja con GDI+ de Windows PowerShell, así que no necesita dependencias.
- **Íconos de disciplina y de etiqueta:** usan `MaterialCommunityIcons`, ya incluido en `@expo/vector-icons`.
- **Sin coincidencia:** la disciplina se busca por nombre de clase, y si el nombre no coincide se usa un ícono y una descripción genéricos.

### D9. Textos centralizados
Todos los textos nuevos viven en `messages.ts`: saludo, lema, etiquetas, descripciones por disciplina y etiquetas de accesibilidad. Los del insumo se mantienen literales.

### D10. Elementos del mockup que no se implementan

| Elemento del mockup | Decisión | Motivo |
|---|---|---|
| Fotos de las clases y del splash | Ícono por disciplina y fondo oscuro | Sin imágenes con licencia (supuesto UI-2) |
| Campana de notificaciones, "Notificaciones" | No se muestra | Notificaciones fuera del alcance del insumo |
| "Cerrar sesión", "Datos de la cuenta", ajustes | No se muestra | No hay login (insumo) |
| "Historial de clases" | No se muestra | Las reservas pasadas se purgan (minimización de datos) |
| Compartir, "Ver todas", "Ayuda y soporte" | No se muestra | Sin destino en el MVP; el selector de día ya muestra todo |
| "Reserva realizada con éxito" | "¡Listo! Tu cupo está reservado" | Texto literal del insumo (supuesto UI-4) |
| Texto blanco en botones verdes | Texto oscuro | Contraste AA (supuesto UI-5) |

## Risks / Trade-offs

- **Contraste del tema oscuro.** Cada par texto/fondo se cubre con una prueba.
- **Más superficie de UI.** Hay un escenario con prueba por comportamiento visible, y la lógica queda en hooks.
- **Ícono por nombre de clase.** Si cambia el catálogo se usa el genérico, sin romper la pantalla.
- **El splash podría quedar visible si nunca llega el aviso de contenido.** Se quita a los 3 s.
- **El modal se superpone a la confirmación de cancelar.** `ConfirmDialog` es otro `Modal` y se muestra encima. Se verifica en pruebas y en el emulador.

## Migration Plan

1. Tokens, primitivas y prueba de contraste.
2. Dominio y aplicación: `bookingOf`, `bookingId` y `GetMemberProfile`, conectados en `src/di`.
3. Navegación, splash y encabezados.
4. Pantallas: "Próximas clases" con detalle, "Mis reservas" y "Perfil".
5. Marca, ícono y splash nativo en `app.json`.
6. `npm run verify` y revisión en el emulador Android contra el mockup.

**Rollback:** revertir el commit del cambio. No toca datos guardados ni el formato del almacenamiento.

## Open Questions

Ninguna.
