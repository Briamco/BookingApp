# BookingApp

Plataforma full stack para reservas de propiedades (estilo marketplace) con autenticacion JWT, gestion de publicaciones, reservas, fechas bloqueadas, resenas, carga de imagenes y notificaciones en tiempo real por WebSocket + email.

## Arquitectura

El repositorio esta organizado con una arquitectura por capas en .NET y un cliente web en React:

- API: ASP.NET Core (controladores HTTP, autenticacion, middlewares, OpenAPI/Swagger, WebSockets).
- Application: casos de uso, DTOs e interfaces de aplicacion.
- Domain: entidades, enums, contratos y reglas de dominio.
- Infrastructure: EF Core, repositorios, servicios externos (email/notificaciones), background jobs.
- Client: React + TypeScript + Vite + Tailwind.
- Tests: pruebas unitarias y de concurrencia con xUnit.

## Stack Tecnico

- Backend: .NET 10, ASP.NET Core, EF Core (SQL Server), JWT Bearer.
- Frontend: React 19, TypeScript, Vite 8, Tailwind CSS 4.
- Base de datos: SQL Server.
- Notificaciones: WebSocket en `/api/notification/ws/{userId}`.
- Email: Resend (con fallback SMTP/Gmail en la capa de infraestructura).
- Tests: xUnit, Moq, coverlet.

## Requisitos

- .NET SDK 10.x
- Node.js 20+
- npm 10+
- SQL Server (local o remoto)

## Estructura del Proyecto

```text
BookingApp/
  Api/
  Application/
  Domain/
  Infrastructure/
  Client/
  Tests/
  BookingDb.sql
  BookingApp.slnx
```

## Variables de Entorno

### Backend (Api/.env)

En `Api/.env.example` ya existe la plantilla minima.

Variables recomendadas:

```env
DB_CONNECTION_STRING=Server=localhost,1433;Database=BookingDb;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True;MultipleActiveResultSets=true;
JWT_SECRET=REEMPLAZAR_CON_UN_SECRETO_LARGO_Y_ALEATORIO
JWT_ISSUER=Comit
RESEND_API_KEY=TU_RESEND_API_KEY
RESEND_FROM_EMAIL=Comit <onboarding@resend.dev>
FRONTEND_URL=http://localhost:5173
SMTP_EMAIL=tu_correo@gmail.com
SMTP_PASSWORD=tu_app_password
```

Notas:

- No subas `.env` al repositorio.
- `JWT_ISSUER` y `JWT_SECRET` son obligatorios para iniciar el backend.
- Si no usas Resend, deja configurado el fallback SMTP correctamente.

### Frontend (Client/.env)

```env
VITE_API_URL=https://localhost:7292/api
VITE_WS_URL=wss://localhost:7292
VITE_GOOGLE_MAPS_API_KEY=TU_GOOGLE_MAPS_API_KEY
```

Notas:

- El cliente consume rutas relativas `/api`; Vite usa proxy a `VITE_API_URL` en desarrollo.
- Si no necesitas mapas, puedes ocultar las vistas/componentes que dependen de Google Maps o usar una key de desarrollo.

## Configuracion de Base de Datos

1. Crea una base SQL Server llamada `BookingDb`.
2. Ejecuta el script `BookingDb.sql` para crear tablas y constraints.
3. Verifica que `DB_CONNECTION_STRING` apunte a esa base.

## Como Ejecutar (Desarrollo)

Este repositorio fija el SDK de .NET con `global.json` (10.0.105).

Si usas Linux/WSL y tu instalacion de .NET del sistema presenta errores de targeting packs (por ejemplo `NETSDK1226`), prioriza un SDK local completo en `~/.dotnet` antes de ejecutar comandos:

```bash
export PATH="$HOME/.dotnet:$PATH"
export DOTNET_ROOT="$HOME/.dotnet"
source ~/.bashrc
dotnet --info
```

### 1) Restaurar dependencias backend

Desde la raiz:

```bash
dotnet restore BookingApp.slnx
```

### 2) Levantar API

Nota importante: al hacer build/run de la API, el proyecto ejecuta automaticamente build del frontend y sincroniza `Client/dist` en `Api/wwwroot`.

- En Debug, si no existe `Client/node_modules`, ejecuta `npm install`.
- Luego ejecuta `npm run build` en `Client`.
- Copia los archivos generados a `Api/wwwroot`.

Por eso, la primera compilacion de la API puede tardar mas (instalacion/build del cliente).

```bash
dotnet run --project Api/BookingApp.Api.csproj
```

o con https

```bash
dotnet run --project Api/BookingApp.Api.csproj --launch-profile https
```

Puertos por perfil de desarrollo:

- HTTP: `http://localhost:5134`
- HTTPS: `https://localhost:7292`

Swagger/OpenAPI en desarrollo:

- `https://localhost:7292/swagger`
- `http://localhost:5134/swagger`

### 3) Instalar dependencias frontend

```bash
cd Client
npm install
```

### 4) Levantar frontend

```bash
npm run dev
```

Vite suele iniciar en `http://localhost:5173`.

## Pruebas

Ejecutar suite de tests:

```bash
dotnet test Tests/BookingApp.Tests.csproj
```

O toda la solucion:

```bash
dotnet test BookingApp.slnx
```

## Endpoints Principales

Base URL: `/api`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/confirm`
- `POST /auth/resend-confirmation`
- `GET /auth/me`
- `GET /auth/{id:guid}/public`

### Property

- `GET /property`
- `POST /property`
- `GET /property/{id}`
- `PUT /property/{id}`
- `DELETE /property/{id}`
- `POST /property/{id}/reservate`
- `POST /property/{id}/blockDate`
- `POST /property/{id}/images`
- `GET /property/{id}/images`
- `DELETE /property/{id}/images/{imageId}`
- `PUT /property/{id}/images/reorder`

### Reservation

- `GET /reservation/me`
- `PUT /reservation/{id}`
- `PATCH /reservation/{id}/cancel`
- `PATCH /reservation/{id}/complete`

### BlockedDate

- `PUT /blockeddate/{id}`

### Review

- `POST /review/reservation/{reservationId}`

### Notification

- `GET /notification/user/me`
- `GET /notification/{id}`
- `PUT /notification/{id}/read`
- WebSocket: `GET /notification/ws/{userId}?access_token={jwt}`

## Autorizacion y Roles

La API usa JWT Bearer y restricciones por rol en controladores:

- Publico: lectura de propiedades, registro/login/confirmacion.
- Host: gestion de propiedades, imagenes, bloqueos y cierre de reservas.
- Guest: crear/cancelar reservas y publicar resenas.
- Cualquier usuario autenticado: perfil (`/auth/me`), reservas propias y notificaciones.

## Notificaciones

El flujo de notificaciones contempla:

- Persistencia de notificaciones en base de datos.
- Entrega push en tiempo real por WebSocket.
- Envio por email (segun tipo de notificacion y configuracion).

Referencias utiles dentro del repo:

- `NOTIFICATION_INTEGRATION_GUIDE.md`
- `Api/NotificationExamples.http`

## Build de Frontend para Servir desde API

Este flujo ya esta automatizado dentro de `Api/BookingApp.Api.csproj`.

Cada vez que compilas/ejecutas la API:

- Se construye el frontend (`npm run build` en `Client`).
- Se copian los artefactos de `Client/dist` a `Api/wwwroot`.

Si quieres forzar regeneracion manual del frontend, puedes hacerlo igual desde `Client`, pero no es obligatorio para que la API sirva la SPA.

## Troubleshooting Rapido

- Error de JWT al iniciar API:
  - Revisa `JWT_SECRET` y `JWT_ISSUER` en `Api/.env`.
- Error `NETSDK1226` al ejecutar `dotnet run` o `dotnet test`:
  - Verifica con `dotnet --info` que la ruta de SDK apunte a una instalacion con packs completos.
  - Si hay conflicto con instalacion del sistema, usa SDK local en `~/.dotnet` y exporta `PATH` y `DOTNET_ROOT`.
  - Confirma que `global.json` del repo se respeta (SDK `10.0.105`).
- Errores de conexion SQL:
  - Valida host/puerto/credenciales en `DB_CONNECTION_STRING`.
- Frontend no llega al backend:
  - Revisa `VITE_API_URL` y certificado HTTPS local del backend.
- WebSocket no conecta:
  - Verifica token JWT valido y que la URL use `ws://` o `wss://` segun protocolo.
- No llegan emails:
  - Revisa `RESEND_API_KEY`, remitente y/o credenciales SMTP.

## Matriz de Cumplimiento de Requisitos (REQUIREMENTS.md)

Estado actualizado al 20-04-2026.

| Requisito | Backend | Frontend | Estado |
|---|---|---|---|
| 1. Gestion de usuarios (registro, login, JWT, confirmacion por correo) | Implementado con bloqueo de usuarios no confirmados, expiracion de token y reenvio de confirmacion (`POST /auth/resend-confirmation`) | Flujos de registro, login, confirmacion y reenvio implementados | Cumple |
| 2. Roles y control de acceso | Endpoints protegidos por roles Host/Guest y autorizacion JWT | Rutas separadas para host y guest con guards dedicados | Cumple |
| 3. Gestion de propiedades (Host) | Crear, editar y eliminar propiedades con validacion de ownership | Vistas de gestion de propiedades para host | Cumple |
| 4. Disponibilidad y busqueda | Filtros por ubicacion, fechas, capacidad y precio; exclusiones por reservas confirmadas y bloqueos | Busqueda con filtros y consumo de resultados disponibles | Cumple |
| 5. Reservas y ciclo de estados | Creacion en Confirmed y acciones de negocio para cancelar/completar con validaciones | Flujos de reserva y cancelacion integrados | Cumple |
| 6. Restriccion de transiciones invalidas | Reglas de dominio para evitar cambios invalidos de estado | No expone cambios de estado genericos en UI | Cumple |
| 7. Reseñas | Solo permite reseña para reserva Completed, una reseña por reserva y rating 1-5 | Dialogo de reseña para reservas completadas | Cumple |
| 8. Promedio de calificacion por propiedad | Calculado en respuestas de propiedad | Mostrado en listados y detalle | Cumple |
| 9. Notificaciones internas | Persistencia, listado, filtro de no leidas y marcado como leida | Centro de notificaciones y acciones de lectura | Cumple |
| 10. Notificaciones por correo y push | Generacion automatica por eventos relevantes, push por WebSocket y envio por email desacoplado | Suscripcion en tiempo real y refresco de bandeja | Cumple |
| 11. Concurrencia en reservas | Lock por propiedad + transaccion + validacion de solapamiento | No aplica logica de concurrencia en cliente | Cumple |
| 12. Evidencia de concurrencia | Prueba automatizada que garantiza una sola reserva exitosa en solicitudes simultaneas | No aplica | Cumple |
| 13. Arquitectura Onion y separacion de responsabilidades | Capas separadas (Api, Application, Domain, Infrastructure) con reglas de negocio fuera de controllers | Cliente desacoplado consumiendo API | Cumple |
| 14. Manejo de errores y validaciones | Validaciones de negocio y respuestas de error controladas | Manejo de errores y feedback en UI | Cumple |
| 15. Frontend obligatorio (consumo API, login/logout, rutas protegidas, vistas diferenciadas) | API preparada para flujos autenticados y por rol | Login/logout, proteccion de rutas y separacion host/guest implementadas | Cumple |

Validacion tecnica ejecutada:

- Suite de tests backend: 18 pruebas aprobadas.
- Build frontend: compilacion exitosa con TypeScript + Vite.

## Estado Actual y Mejoras Sugeridas

Sugerencias para evolucionar el proyecto:

- Agregar migraciones EF Core para versionado de esquema.
- Agregar CI (build + test + lint) en pull requests.
- Endurecer manejo de secretos (vault/secret manager).
- Documentar contratos de API con ejemplos por endpoint.
- Agregar tests de integracion para controladores criticos.
