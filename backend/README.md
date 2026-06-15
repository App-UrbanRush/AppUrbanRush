# 🚀 UrbanRush — Backend 

Backend de la plataforma **UrbanRush**, un sistema de delivery que conecta usuarios, negocios (vendors) y domiciliarios. Construido con NestJS siguiendo principios de **Clean Architecture** y **Domain-Driven Design**.

---

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Módulos](#-módulos)
- [Requisitos Previos](#-requisitos-previos)
- [Variables de Entorno](#-variables-de-entorno)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Scripts Disponibles](#-scripts-disponibles)
- [WebSockets](#-websockets)
- [Roles y Permisos](#-roles-y-permisos)
- [Despliegue](#-despliegue)

---

## 🛠 Tecnologías

| Categoría | Tecnología |
|---|---|
| Framework | NestJS 11 + TypeScript 5 |
| Base de datos relacional | PostgreSQL + TypeORM |
| Base de datos documental | MongoDB + Mongoose |
| Caché / GPS en tiempo real | Redis + ioredis |
| Autenticación | JWT + Passport + Google OAuth 2.0 |
| Pagos | Wompi (pasarela colombiana) |
| Almacenamiento de archivos | Cloudinary |
| Tiempo real | Socket.IO (WebSockets) |
| Correo electrónico | Nodemailer + plantillas Handlebars |
| Generación de reportes | ExcelJS + pdfmake |
| Chatbot IA | Groq SDK |
| Validación | class-validator + class-transformer |
| Documentación API | Swagger / OpenAPI |
| Node.js | >= 20.0.0 |

---

## 🏗 Arquitectura

El proyecto sigue **Clean Architecture** con separación en tres capas por módulo:

```
src/<modulo>/
├── application/          # Casos de uso (Use Cases) y DTOs
│   ├── dtos/
│   └── use-cases/
├── domain/               # Entidades, interfaces y repositorios (contratos)
│   ├── entities/
│   ├── interfaces/
│   └── repositories/
└── infrastructure/       # Implementaciones concretas (DB, controladores, etc.)
    ├── controllers/
    ├── repositories/
    └── schemas/
```

**Patrones de diseño implementados:**
- **Repository Pattern** — abstracción de acceso a datos
- **Use Case Pattern** — lógica de negocio aislada por operación
- **State Machine** — máquina de estados para el ciclo de vida de pedidos
- **Chain of Responsibility** — cadena de intenciones para el chatbot
- **Bridge + Composite** — sistema de notificaciones multicanaldesacoplado
- **Abstract Factory** — creación de notificadores (Socket, Email, Push)
- **Observer** — eventos con `@nestjs/event-emitter`
- **AVL Tree** — índice en memoria para búsqueda de tiendas y productos

---

## 📦 Módulos

| Módulo | Descripción |
|---|---|
| `auth` | Registro, login (email + Google OAuth), JWT, recuperación de contraseña |
| `user` | Gestión de usuarios |
| `people` | Datos personales (nombre, cédula, teléfono, dirección) |
| `vendor` | Perfil de negocio, dashboard, reportes |
| `courier` | Perfil de domiciliario |
| `order` | Ciclo completo de pedidos con máquina de estados |
| `product` | Catálogo de productos por vendor |
| `category` | Categorías de productos por vendor |
| `payment` | Integración con Wompi para cobros |
| `liquidation` | Liquidación semanal automática (vendors y domiciliarios) |
| `tracking` | GPS en tiempo real vía WebSocket + Redis |
| `chat` | Mensajería en tiempo real entre usuarios |
| `chatbot` | Bot de atención automatizada con Groq AI |
| `notifications` | Notificaciones en tiempo real (Socket, Email, Push) |
| `review` | Reseñas y calificaciones de tiendas |
| `storage` | Subida de imágenes a Cloudinary |
| `encrypted-file` | Archivos cifrados para documentos sensibles |
| `store-verification` | Verificación de locales con IA |
| `courier-vendor-request` | Solicitudes de domiciliarios a negocios |
| `reports` | Generación de reportes en Excel y PDF |
| `admin` | Panel de administración con auditoría |
| `backup` | Respaldo de bases de datos |
| `health` | Health check del sistema |
| `notifications/search` | Búsqueda de tiendas y productos (índice AVL en memoria) |

---

## ✅ Requisitos Previos

- Node.js >= 20
- npm >= 10
- PostgreSQL
- MongoDB
- Redis

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Aplicación
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=urbanrush

# MongoDB
MONGO_URI=mongodb://localhost:27017/urbanrush

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=tu_secreto_jwt

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=

# Wompi (Pagos)
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_EVENTS_SECRET=

# Groq AI (Chatbot)
GROQ_API_KEY=

# Negocio
DELIVERY_FEE=3000
PLATFORM_COMMISSION=0.15

# FastAPI (Estimación de entrega)
FASTAPI_URL=http://localhost:8000
```

---

## 🚀 Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar en modo desarrollo
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.
La documentación Swagger en `http://localhost:3000/api`.

---

## 📜 Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run start:dev

# Desarrollo modo debug
npm run start:debug

# Producción
npm run build
npm run start:prod

# Tests
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Cobertura de tests

# Linting y formato
npm run lint
npm run format

# Seeds (datos de prueba)
npm run seed:courier-earnings <COURIER_ID>
```

---

## 🔌 WebSockets

El servidor expone dos namespaces de Socket.IO:

### `/tracking` — GPS en tiempo real
Permite que los domiciliarios transmitan su ubicación en vivo y que los usuarios suscritos la reciban.

| Evento (emit) | Descripción |
|---|---|
| `courier:location:update` | El domiciliario envía su posición `{ order_id, lat, lng, accuracy, speed, heading }` |
| `order:tracking` | El usuario se suscribe al tracking de un pedido `{ order_id }` |

| Evento (on) | Descripción |
|---|---|
| `courier:location` | El usuario recibe la posición actualizada del domiciliario |
| `location:saved` | Confirmación al domiciliario de que la ubicación fue guardada |
| `tracking:closed` | El tracking finalizó (pedido entregado) |

> Hay un cliente de prueba HTML en `scripts/gps-test-client.html`.

### `/notifications` — Notificaciones en tiempo real
Notificaciones push a usuarios autenticados mediante Socket.IO.

---

## 👥 Roles y Permisos

| ID | Rol | Descripción |
|---|---|---|
| 1 | `Admin` | Administrador de la plataforma |
| 2 | `User` | Cliente que realiza pedidos |
| 3 | `Domiciliario` | Repartidor |
| 4 | `Empresa` (Business) | Dueño de negocio/vendor |
| 5 | `SuperAdmin` | Superadministrador con acceso total |

La autenticación usa **JWT Bearer Token**. Las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

**Usuarios de prueba (seed):**

| Email | Contraseña | Rol |
|---|---|---|
| `usuario@gmail.com` | (ver seed) | User |
| `domicilio@gmail.com` | (ver seed) | Domiciliario |
| `negocio@gmail.com` | (ver seed) | Empresa |

---

## 💳 Flujo de Pagos y Liquidación

1. El usuario crea un pedido y genera un pago con **Wompi**.
2. Wompi confirma el pago vía webhook (`POST /payments/webhook`).
3. Cada semana, el sistema ejecuta automáticamente la **liquidación semanal**:
   - Los vendors reciben su parte neta (subtotal − comisión de plataforma).
   - Los domiciliarios reciben su tarifa de entrega.
   - Los pagos se ejecutan vía Wompi Payouts.
4. Se envían emails de confirmación o falla con las plantillas Handlebars.

La comisión de la plataforma y la tarifa de entrega se configuran con `PLATFORM_COMMISSION` y `DELIVERY_FEE` en el `.env`.

---

## 🚢 Despliegue

El proyecto está configurado para desplegarse en **Railway** (`railway.json`):

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --legacy-peer-deps --include=dev && npm run build"
  },
  "deploy": {
    "startCommand": "node dist/main",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Para desplegar manualmente en cualquier servidor:

```bash
npm run build
node dist/main
```

---

## 📄 Licencia

Proyecto privado — todos los derechos reservados.