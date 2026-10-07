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
