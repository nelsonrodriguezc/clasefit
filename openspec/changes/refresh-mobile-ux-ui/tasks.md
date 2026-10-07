# Tasks

## 1. Sistema visual base

- [x] 1.1 Centralizar la paleta oscura, espaciados, radios y estilos de feedback en `src/presentation/theme.ts` y verificar con pruebas de presentación que los tokens compartidos siguen disponibles para las pantallas nuevas y existentes.
- [x] 1.2 Extraer primitivas reutilizables para tarjetas, chips y banners del shell visual, y verificar con React Native Testing Library que renderizan estados normales, exitosos y de error sin duplicar estilos por pantalla.

## 2. Navegación y arranque

- [x] 2.1 Añadir la pantalla de splash/arranque con branding de ClaseFit y verificar con la prueba de smoke que la app pasa del inicio al shell autenticado sin pantalla vacía intermedia.
- [x] 2.2 Extender la navegación para incluir la superficie de perfil y la ruta de detalle de clase, verificando con pruebas de navegación que cada destino sea alcanzable desde el shell principal.

## 3. Renovación de "Próximas clases"

- [x] 3.1 Rehacer la pantalla de "Próximas clases" con encabezado visual, chips de fecha y tarjetas más ricas, y verificar con pruebas de pantalla que siguen visibles los estados reservada, llena y disponible.
- [x] 3.2 Implementar la superficie de detalle de clase y verificar con una prueba de aceptación que al abrir una clase se ve su resumen y al volver la lista conserva su estado.

## 4. Renovación de "Mis reservas" y feedback

- [x] 4.1 Rehacer la pantalla de "Mis reservas" con el nuevo lenguaje visual y la acción de cancelación destacada, y verificar con pruebas de pantalla que el estado vacío sigue mostrando "Aún no tienes reservas".
- [x] 4.2 Unificar el estilo de los feedbacks de éxito, error y carga, y verificar con las pruebas de reserva/cancelación que los mensajes literales del insumo siguen apareciendo sin cambios.

## 5. Validación final

- [x] 5.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run verify`, y verificar que la suite completa pasa contra la UI renovada antes de pedir revisión.

## 6. Ajustes tras la revisión contra el mockup

- [x] 6.1 Reescribir proposal, spec, design y tareas con los hallazgos de la revisión. Verificación: `openspec validate refresh-mobile-ux-ui --strict` sin errores.
- [x] 6.2 Reescribir `__tests__/acceptance/app-shell.test.ts` desde los escenarios nuevos (un `describe` por requisito y un `it` por escenario). Verificación: las pruebas nuevas fallan antes de implementar y la prueba de trazabilidad las encuentra.
- [x] 6.3 Dominio y aplicación: agregar `bookingOf`, `bookingId` en `UpcomingClass` y el caso de uso `GetMemberProfile` con el evento `member.read_failed`, y conectarlos en `src/di` y en el arnés de pruebas. Verificación: pruebas unitarias y 100 % de líneas en dominio y aplicación.
- [x] 6.4 Tema y primitivas: paleta del mockup, prueba de contraste AA, etiquetas, íconos de disciplina, avisos con ícono y botones con variantes. Verificación: prueba "Pares de texto y fondo del tema" y pruebas de primitivas.
- [x] 6.5 Navegación y arranque: orden de pestañas, tema oscuro, barra de estado clara y `BrandSplash` con aviso de contenido y tiempo máximo. Verificación: escenarios de "Pantalla de inicio con la marca" y "Pestañas en el orden del mockup".
- [x] 6.6 "Próximas clases": encabezado con los datos de la socia, selector de día, secciones por día y tarjetas. Verificación: escenarios de saludo, selector y tarjetas, y las pruebas existentes de la pantalla.
- [x] 6.7 Detalle: clase viva, descripción y etiquetas por disciplina, reservar y cancelar (hook `useCancellation` compartido con "Mis reservas") con el aviso dentro del detalle. Verificación: escenarios de "Detalle de clase" y "Reservar y cancelar desde el detalle", y las pruebas existentes de "Mis reservas".
- [x] 6.8 "Mis reservas" y "Perfil": aviso de la regla de cancelación, tarjetas con ícono y perfil con datos reales, reservas activas y acceso a "Mis reservas". Verificación: escenarios de ambos requisitos.
- [x] 6.9 Marca: SVG fuente, PNG de ícono, ícono adaptativo, splash y marca en la app; `app.json` con ícono y splash nativo (`expo-splash-screen`). Verificación: `npx expo config` sin errores, `npx expo-doctor` y prueba de configuración de release.
- [x] 6.10 Verificación final: `npm run verify` en verde y sin advertencias de `act()`, más revisión en el emulador Android contra el mockup con capturas nuevas en `docs/evidencias/`.
