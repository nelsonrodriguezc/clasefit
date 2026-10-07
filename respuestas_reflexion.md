# Preguntas de reflexión · Desarrollador React Native espartano

### 1. ¿Qué experiencia previa tenías usando OpenSpec o SDD?

Antes de esta experiencia no había trabajado directamente con OpenSpec ni con SDD como metodología formal. Sí había trabajado con documentación técnica, historias de usuario, diseños y definición de requerimientos, pero no con este enfoque estructurado. Para prepararme tuve que entender primero el propósito de la metodología y cómo llevarla a mi flujo de desarrollo; por ejemplo, con la versión 1.14 de OpenSpec el contexto del proyecto ya no vive en `project.md` sino en `openspec/config.yaml`.

### 2. ¿Cómo crees que cambia el rol de desarrollador React Native antes y después de conocer y aplicar este framework?

Creo que el desarrollador deja de enfocarse únicamente en escribir código y pasa a involucrarse más en la definición de lo que se va a construir. Antes podía empezar directamente desde una tarea o requerimiento; ahora veo más importante analizar, especificar y validar antes de implementar. En este ejercicio, por ejemplo, la duda sobre si se puede cancelar exactamente 2 horas antes (RN-04) apareció al escribir los escenarios, no al programar, y quedó como supuesto documentado y probado en el borde.

### 3. ¿Cómo crees que debería trabajar ahora un equipo que usa esta metodología?

El equipo debería dedicar más tiempo al inicio de cada tarea para alinear requisitos, comportamiento esperado y criterios de aceptación. La especificación debería ser un punto de referencia común para desarrollo, revisión y pruebas: aquí cada escenario tiene una prueba con el mismo nombre y una prueba de trazabilidad falla si falta alguno. También considero importante que los cambios se actualicen en la especificación y no únicamente en el código; cuando el emulador mostró un problema de expo-crypto en Android, se actualizó el `design.md` junto con la corrección.

### 4. ¿Qué ventajas y desventajas ves?

La principal ventaja que veo es que reduce ambigüedades y permite detectar problemas antes de empezar a desarrollar, como los casos borde del doble toque simultáneo o las clases que empiezan justo en el momento de consultarlas. También facilita las revisiones y hace más claro qué se espera del resultado final. Como desventaja, puede aumentar el tiempo inicial de una tarea, especialmente cuando el requerimiento es pequeño o cambia constantemente; incluso OpenSpec advirtió que este cambio era grande (más de 10 requisitos) y convenía dividirlo.

### 5. ¿Cuándo usarías y cuándo no usarías este método?

Lo usaría principalmente en funcionalidades importantes, con varios involucrados, cambios de arquitectura o requisitos que puedan generar interpretaciones diferentes. También lo veo útil cuando una funcionalidad necesita buena trazabilidad entre requerimiento, implementación y pruebas, como las reglas RN-01 a RN-04 y la protección de las reservas. No lo aplicaría con el mismo nivel de detalle para cambios muy pequeños, correcciones simples o tareas experimentales donde todavía no está claro qué solución se busca, como la configuración inicial de herramientas.
