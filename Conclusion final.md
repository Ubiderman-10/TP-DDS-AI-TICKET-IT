CONCLUSIÓN: REFLEXIÓN SOBRE EL USO DE INTELIGENCIA ARTIFICIAL EN EL DESARROLLO
Trabajo Práctico Individual - AI Ticket It - 2C 2026


1. HERRAMIENTAS Y FORMA DE TRABAJO

Usé tres herramientas de IA con roles distintos.

Cline, un agente de programación open source integrado al editor y a la terminal, lo usé para generar la primera versión completa del backend (Node + Express) y del frontend (React Native con Expo). Lo elegí por varias razones:

- Permite elegir distintos proveedores y modelos de IA. Cuando se agotaba el uso disponible de uno, podía pasar a otro y seguir trabajando sin frenar el desarrollo.

- Tiene modo Plan y modo Act. En el modo Plan se acuerda primero la estrategia, y recién en el modo Act se ejecutan los cambios: crear y modificar archivos y correr comandos con mi aprobación. Eso me permitió revisar el plan antes de que se tocara el código.

- Ofrece comandos que se invocan con "/", de los que aproveché las distintas opciones durante el desarrollo.

- Al estar integrado en el editor y en la terminal, resulta más sencillo revisar el proyecto y los cambios sin salir del entorno de trabajo.

Claude, un asistente conversacional, lo usé después como segunda herramienta, y tuvo un papel importante en dos cosas.

Verificación: revisó el proyecto completo contra la consigna y el diagrama de clases, ejecutó los tests, probó los endpoints del backend, comprobó que la aplicación móvil compilara y detectó los problemas de integración entre el backend y el frontend. También comprobó que los tests nuevos realmente detectan errores, rompiendo reglas de negocio a propósito para ver si fallaban.

Generación y optimización de código: produjo código nuevo y reescribió partes existentes (reglas de negocio, pantallas, tests y documentación), centralizando estilos y componentes reutilizables para reducir la duplicación y simplificar el código.

Copilot, integrado en VS Code, lo usé en la etapa final para revisar y corregir problemas concretos sin volver a generar el proyecto completo. Me ayudó a reforzar validaciones de eventos, entradas y reseñas; corregir errores de manejo de usuarios en el chat; resolver el flujo de cancelación y reembolso en una sola solicitud; y alinear respuestas del backend, pantallas y documentación. También ayudó a eliminar un componente duplicado que no se usaba y a ordenar la configuración de los paquetes. Los cambios se fueron comprobando con tests, compilación web y solicitudes HTTP.

La mayor parte del código fue generada por estas herramientas, como propone la consigna. Mi trabajo consistió en dirigirlas, tomar las decisiones de diseño y de producto, probar la aplicación en el celular y verificar cada resultado contra la consigna y el diagrama de clases. Trabajé con cambios chicos: aplicaba un cambio, lo probaba y recién después pasaba al siguiente.


2. MI APORTE Y MIS DECISIONES

- Probé la aplicación en un dispositivo real y reporté los errores que fui encontrando. Por ejemplo: errores al entrar al chat y al enviar mensajes, un selector de cantidad que volvía al mínimo después del máximo, y un flujo de pruebas mal armado en el que noté que una compra no estaba en el estado que se indicaba.

- Verifiqué el comportamiento contra la consigna. Por ejemplo, cuestioné por qué una reseña aparecía en los dos eventos de un mismo organizador y lo contrasté con el caso de uso que pide mostrar las reseñas de eventos anteriores en los eventos de cada organizador.

- Detecté que un usuario comprador podía crear eventos y que un organizador podía comprar, y decidí cómo resolverlo: consulté al docente, que confirmó que tener múltiples roles es posible pero no obligatorio, lo contrasté con el diagrama de clases y resolví separar las funcionalidades de organizador y comprador.

- Definí mejoras de producto y de experiencia de uso: un apartado "Mis eventos" para el organizador; filtros y ordenamiento como listas desplegables, con orden por mayor o menor precio, fecha más próxima o más lejana, y mayor o menor puntaje; selector de calendario y de hora al crear un evento; categorías que se pueden ampliar en lugar de una lista cerrada; ayuda al mantener presionados los botones de ícono; y que el teclado no tape lo que se escribe.

- Revisé que se cumplan los casos de uso de la consigna y corregí nombres y comportamientos que resultaban confusos para el usuario, como el orden por fecha de eventos futuros.

- En la revisión final pedí que los problemas detectados se contrastaran con el enunciado antes de corregirlos y fui decidiendo qué cambios aceptar. Por ejemplo, definí que cada comprador pudiera dejar una sola reseña por evento y que la fecha y hora programadas fueran el umbral para usar una entrada o reseñar. También pedí entender mejor el flujo de cancelar y reembolsar antes de aprobar su modificación, y decidí dejar los arreglos juntos para un solo commit al terminar la revisión.


3. VENTAJAS

- Velocidad. Pude llegar de la consigna a una aplicación completa en mucho menos tiempo del que habría necesitado solo, y con tecnologías que no había usado antes, como React Native con Expo.

- Aprendizaje de tecnologías nuevas. Poder preguntar por qué algo fallaba, y no solo recibir la solución, me ayudó a entender cómo se organiza una aplicación móvil: navegación, estado, consumo de una API.

- Trabajo que habría dejado para el final o directamente omitido. Con la IA agregué reglas de negocio más completas, un rediseño visual de toda la aplicación, selectores nativos de fecha y hora, documentación de la API y tests: pasé de 40 a 79 tests automáticos, incluyendo pruebas de permisos por rol, validaciones y ordenamiento.

- Complementarse entre herramientas. El agente fue útil para generar mucho código de una vez, con continuidad gracias a poder cambiar de modelo cuando se agotaba uno, y con el modo Plan para revisar la estrategia antes de ejecutarla. El asistente conversacional fue más útil para diagnosticar problemas puntuales y avanzar en pasos pequeños y controlados.

- Verificación cruzada. Que una segunda herramienta revisara lo que había generado la primera me permitió encontrar problemas de integración, de configuración y de documentación que, de otro modo, habría descubierto mucho más tarde.


4. DESVENTAJAS

- Código con apariencia correcta pero sin integrar. El backend generado tenía 40 tests en verde y, sin embargo, la API no funcionaba: la aplicación solo exponía una ruta de prueba y ninguna de las rutas reales estaba conectada. El frontend, por su parte, arrancaba con la pantalla de plantilla de Expo y no con mi aplicación.

- Piezas coherentes por separado pero incompatibles entre sí. El frontend esperaba respuestas sin envolver y el backend las devolvía dentro de una propiedad "data"; las rutas que llamaba el frontend no coincidían con las del backend; los estados de una compra se comparaban en mayúsculas y el backend los devolvía con otro formato; faltaban datos obligatorios en las peticiones, como el identificador del usuario que realiza la acción.

- Configuración inconsistente. El comando de tests apuntaba a una herramienta (Jest) distinta de la que usaban los tests (el ejecutor nativo de Node), y el manifiesto raíz tenía una configuración vieja de Expo que no correspondía a la aplicación real. En la revisión final se ordenaron los comandos del proyecto y se quitaron Jest y Babel-Jest del backend; los tests se ejecutan con `node --test`.

- Documentación que contradecía el código. En una primera revisión encontré rutas, códigos de error y reglas de permisos que no coincidían con la implementación. También la respuesta documentada para consultar disponibilidad incluía campos que el endpoint no devuelve. Durante la revisión final actualicé `API.md` para reflejar esa respuesta y documentar las reglas de negocio y el flujo de cancelación y reembolso. Aprendí que los ejemplos de la documentación también hay que contrastarlos con la API real.

- Errores introducidos por la propia IA al corregir. Por ejemplo, un error en el selector de cantidad de entradas que reiniciaba el valor al llegar al máximo, un error de renderizado en el chat por una importación mal resuelta, y un guion de pruebas mal armado que yo seguí y que me llevó a conclusiones equivocadas hasta que lo noté.

- Afirmaciones hechas con seguridad sin verificar. La IA sostuvo primero que el modelo soportaba que una misma persona fuera organizador y comprador basándose en el código, sin haber mirado el diagrama de clases.

- Riesgo de dependencia. Es fácil aceptar código que "parece funcionar" sin entenderlo, y después no poder explicarlo ni mantenerlo.

- Ausencia de autenticación real. La API recibe identificadores de usuario en las solicitudes; por eso, aunque valida los permisos del dominio, no comprueba por sí sola quién está enviando esos identificadores. Para el alcance académico se mantuvo esa limitación, pero no sería suficiente para una aplicación en producción.


5. DIFICULTADES ENCONTRADAS

- Encontrar por qué algo que "debería funcionar" no funcionaba. Tuve que revisar el proyecto completo, capa por capa, hasta descubrir que faltaba la conexión entre el servidor, las rutas y la aplicación móvil.

- Problemas de entorno que la IA no puede ver desde afuera: versiones de Expo, la conexión entre el celular y mi computadora en la misma red, y el comportamiento del teclado en el dispositivo.

- Decisiones de diseño sin una respuesta única. La consigna no define si un usuario puede ser a la vez organizador y comprador. Después de consultar al docente y revisar el diagrama de clases, que no tiene un atributo de rol, decidí separar las funcionalidades de ambos perfiles agregando un atributo "rol" al usuario. Es una desviación del diagrama que tomé a conciencia y puedo justificar.

- Mantener la consistencia entre lo que generaban distintas herramientas y distintas sesiones: nombres, formatos y reglas que cambiaban de un lugar a otro.


6. APRENDIZAJES OBTENIDOS

- Que los tests en verde no garantizan que el sistema funcione. Hay que probarlo de punta a punta, en el dispositivo real, siguiendo los casos de uso de la consigna.

- Que hay que verificar lo que dice la IA contra la fuente: la consigna, el diagrama y el código real. Puede responder con seguridad algo que no comprobó.

- Que el criterio técnico sigue siendo mío. La IA propone; yo decido y tengo que poder justificar cada decisión.

- Que conviene trabajar con cambios pequeños y verificables, en lugar de pedir grandes bloques de código de una vez.

- Que un error que no se ve leyendo el código aparece al usar la aplicación: varios problemas los detecté recién al probarla en el celular.

- A nivel técnico: estructurar un backend en capas (rutas, controladores, servicios, dominio y repositorios), separar las reglas de negocio de la capa HTTP, modelar estados y permisos, y en el frontend manejar navegación, estado de sesión y consumo de una API en React Native.


7. VALORACIÓN PERSONAL

Mi valoración es que estas herramientas aumentan mucho la productividad en la construcción, la refactorización, el diseño de interfaz y la escritura de tests, y reducen el tiempo que pasa entre una idea y algo que se puede probar.

Pero no reemplazan entender el código ni verificarlo. Gran parte del tiempo que ahorré generando código lo invertí después en depurar y alinear piezas que no encajaban entre sí. Mi impresión es que el ahorro real existe, pero es menor de lo que parece a simple vista si no se cuenta el costo de revisar, integrar y probar.

Sobre la calidad del resultado final: creo que depende menos de qué tan bien escriba código la IA y más de qué tan bien la dirija, la revise y la pruebe quien la usa. La versión final de la aplicación es mejor que la primera versión generada justamente porque la revisé, la probé, encontré sus fallas y las corregí.

En síntesis, la considero una herramienta muy potente cuando se usa con criterio, y riesgosa cuando se acepta lo que genera sin comprobarlo.