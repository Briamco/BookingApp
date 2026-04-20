# Plataforma de Reservas de Alojamientos

## Propósito de la práctica

El objetivo de esta práctica es diseñar e implementar una API REST que modele un sistema real
de reservas, aplicando:

- Reglas de negocio coherentes
- Manejo de estados
- Validación de disponibilidad por fechas
- Control de acceso por roles
- Separación adecuada de responsabilidades en la arquitectura

## Enfoque del problema

El sistema debe simular el comportamiento de una plataforma tipo Airbnb, donde:

- Un usuario puede ser Host (publica propiedades)
- Un usuario puede ser Guest (realiza reservas)

Un mismo usuario puede tener ambos roles.

## Alcance funcional

### 1. Gestión de Usuarios

- Registro de usuarios
- Inicio de sesión
- Autenticación con JWT
- Confirmación de cuenta por correo electrónico

**Reglas de negocio**

- Un usuario no confirmado:
o No puede iniciar sesión
o No puede usar el sistema
- El token de confirmación:
o Debe expirar
o Solo puede usarse una vez

### 2. Gestión de Propiedades (Host)

El host puede:

- Crear, editar y eliminar propiedades


- Definir:
o Título
o Descripción
o Ubicación
o Precio por noche
o Capacidad

**Reglas de negocio**

- Un usuario solo puede modificar propiedades que le pertenezcan

### 3. Disponibilidad

Cada propiedad debe manejar disponibilidad por fechas.

**Reglas**

- El host puede bloquear fechas manualmente
- No se puede reservar en fechas:
o Ya reservadas
o Bloqueadas
- No se permiten solapamientos

**Regla de consistencia**

- La disponibilidad de una propiedad se determina exclusivamente a partir de:
o Reservas en estado Confirmada
o Fechas bloqueadas por el host

Estas validaciones deben estar en la API.

### 4. Búsqueda de Propiedades

Filtros:

- Ubicación
- Rango de fechas
- Capacidad
- Precio

La API debe devolver solo propiedades disponibles en ese rango.

### 5. Reservas

**Estados permitidos**

- Confirmada
- Cancelada
- Completada


**Ciclo de vida de la reserva**

Flujo permitido:

- Creación → Confirmada
- Confirmada → Cancelada
- Confirmada → Completada

**Transiciones no permitidas**

- Cancelada → cualquier otro estado
- Completada → cualquier otro estado
- Cancelada → Confirmada
- Completada → Confirmada

**Reglas de negocio**

- Una reserva se crea directamente en estado Confirmada
- Las fechas de reservas confirmadas deben considerarse no disponibles
- Un usuario no puede reservar su propia propiedad

**Validación de solapamiento**
No se permiten reservas que coincidan con:

- Otras reservas Confirmadas
- Fechas bloqueadas por el host

**Cancelación**

- Al cancelar una reserva:
o Las fechas deben liberarse automáticamente

**Finalización (Completada)**

- Una reserva solo puede marcarse como Completada si:
o Ya estaba en estado Confirmada
o La fecha de salida ya ha pasado

**Restricción técnica sobre estados**
No se permite modificar el estado de una reserva mediante operaciones genéricas de
actualización (PUT o PATCH).
El cambio de estado debe realizarse exclusivamente mediante acciones específicas del negocio,
tales como:

- Cancelar reserva
- Completar reserva

Cada acción debe validar las reglas correspondientes y ejecutar la lógica asociada.

### 6. Reseñas


- Solo se puede dejar reseña si la reserva está en estado Completada

Cada reseña incluye:

- Calificación (1–5)
- Comentario

La API debe calcular:

- Promedio de calificación por propiedad

### 7. Notificaciones

El sistema debe generar notificaciones automáticamente como respuesta a eventos relevantes.

**Eventos mínimos requeridos**

- Nueva reserva creada → notificar al host
- Reserva cancelada → notificar al host y al guest
- Reserva completada → notificar al guest

**Canales de notificación**

1. Notificación interna
    - Debe almacenarse en base de datos
    - Debe poder ser consultada por el usuario
2. Notificación por correo electrónico
    - Debe enviarse al usuario correspondiente
    - El contenido debe ser coherente con el evento
**Estructura de la notificación interna**
- Mensaje
- Fecha de creación
- Estado (leída / no leída)
- Usuario destinatario

**Reglas de negocio**

- Las notificaciones deben generarse automáticamente
- Cada notificación debe estar asociada a un usuario
- Un usuario solo puede consultar sus propias notificaciones
- El sistema debe permitir:
o Listar notificaciones
o Filtrar no leídas
o Marcar como leídas

**Reglas específicas para correo**

- El envío no debe bloquear la operación principal


- Fallos en el envío no deben afectar la transacción
- Se permite uso de servicios reales o simulados

**Consideraciones de diseño**

- No se permite generar notificaciones desde controllers
- Deben formar parte de la lógica de negocio
- Se valorará separación entre lógica de reservas y notificaciones

### 8. Manejo de Concurrencia en Reservas

El sistema debe manejar correctamente escenarios donde múltiples usuarios intentan reservar la

misma propiedad en el mismo rango de fechas simultáneamente.

**Regla obligatoria**

- Nunca deben existir dos reservas confirmadas que se solapen para una misma propiedad

**Requisito**

- El estudiante debe implementar un mecanismo que garantice consistencia de datos bajo
concurrencia

**Evidencia obligatoria**

- Se debe demostrar mediante prueba que, ante solicitudes simultáneas, solo una reserva se crea
exitosamente

**Manejo de errores**

- Las solicitudes que fallen deben retornar un mensaje indicando que la propiedad ya no está
disponible

## Requerimientos técnicos

**Backend**

- ASP.NET Core Web API
- Arquitectura Onion
- Entity Framework Core
- Base de datos relacional
- DTOs
- Validaciones
- Manejo de errores centralizado
- JWT + Roles

**Frontend**

- Tecnología libre
- Consumo de API


- Login / Logout
- Protección de rutas
- Vistas diferenciadas

## Restricciones

No se permite:

- Validar reglas solo en frontend
- CRUD sin reglas de negocio
- Reservas sin validación de fechas
- Acceso sin autorización

## Se evaluará

- Implementación correcta de reglas de negocio
- Manejo de estados
- Validación de disponibilidad
- Manejo de concurrencia
- Claridad de endpoints
- Organización del código
- Separación de responsabilidades
- Manejo de errores

## Entregables

- Código backend
- Código frontend
- Migraciones o script de base de datos

## Presentación y defensa del proyecto

El proyecto debe ser presentado en vivo en el aula en la fecha asignada.

```
Criterio
No logrado
(0%)
```
```
Parcialmente logrado (50$) Desarrollado
```
#### 1.

```
Arquitectura
```
```
No impementa la
arquitectura.
Lógica en
```
```
La solución funciona, pero
presenta violaciones a la
arquitectura (capas mezcladas,
```
```
Implementación correcta de
arquitectura Onion.
Separación clara de capas,
```

**Onion (8.
pts)**

```
controllers o
acceso directo a
datos.
```
```
dependencias incorrectas, lógica
mal ubicada.) Solo funcional en
el backend
```
```
dependencias bien definidas y
lógica de negocio ubicada
correctamente.
```
**2. Gestión de
usuarios y
autenticación
(2.0 pts)**

```
No funciona el
registro/login o
no hay
autenticación.
```
```
Funciona parcialmente (falta
confirmación de cuenta, JWT
incompleto o roles mal
aplicados). Solo funcional en el
backend
```
```
Registro, login, JWT y
confirmación de cuenta
funcionando correctamente.
Control de acceso aplicado
según roles.
```
**3. Gestión de
propiedades
(2.0 pts)**

```
No permite
gestionar
propiedades o no
hay validación
de ownership.
```
```
Funcionalidad parcial (CRUD
incompleto o sin validación
adecuada del propietario). Solo
funcional en el backend
```
```
Permite crear, editar y
eliminar propiedades
correctamente, validando que
solo el propietario pueda
gestionarlas.
```
**4.
Disponibilidad
y búsqueda
(2.0 pts)**

```
No se valida
disponibilidad o
la búsqueda no
filtra
correctamente.
```
```
Validación parcial (no cubre
todos los casos de fechas o
filtros incompletos). Solo
funcional en el backend
```
```
Disponibilidad correctamente
calculada y búsqueda
devuelve únicamente
propiedades disponibles
según filtros.
```
**5. Reservas y
manejo de
estados (2.
pts)**

```
Reservas como
CRUD simple.
No se respetan
estados ni reglas
de negocio.
```
```
Flujo parcialmente
implementado (estados sin
control completo o validaciones
incompletas). Solo funcional en
el backend
```
```
Flujo completo de reservas
con estados controlados
mediante acciones y reglas de
negocio correctamente
aplicadas.
```
**6.
Concurrencia
en reservas
(2.0 pts)**

```
Se permiten
dobles reservas
en escenarios
simultáneos.
```
```
Existe intento de control, pero
no garantiza consistencia o no
se demuestra.
```
```
Se evita la doble reserva bajo
concurrencia y se demuestra
mediante pruebas.
```
#### 7.

**Notificaciones
(2.0 pts)**

```
No se
implementan o
no responden a
eventos del
sistema.
```
```
Implementación parcial (faltan
eventos, no se persisten o están
acopladas incorrectamente).
Solo funcional en el backend
```
```
Notificaciones generadas
correctamente ante eventos,
persistidas y consultables por
el usuario.
```
**Solucion
complete
Backend +
Frontend
functional**

```
Solo funcional el
backend (-10pts)
Funcionalidad completa 0pts
```

**Defensa
presencial**

```
Solo subido a la
plataforma -
10pts
```
```
Presentado en el aula
```

