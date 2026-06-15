# UrbanRush — Frontend

Aplicación web de delivery construida con **React + TypeScript + Vite**. Permite a clientes explorar tiendas y productos, realizar pedidos y hacer seguimiento en tiempo real. Cuenta con paneles dedicados para negocios (vendedores), domiciliarios y administradores.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Roles y módulos](#roles-y-módulos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y desarrollo](#instalación-y-desarrollo)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)

---

## Tecnologías

| Categoría | Librería / Herramienta |
|---|---|
| Framework UI | React 18 + TypeScript |
| Build tool | Vite |
| Estilos | Tailwind CSS 4 |
| Routing | React Router DOM v7 |
| Formularios | React Hook Form + Zod |
| HTTP | Axios |
| WebSockets | Socket.IO Client |
| Mapas | Leaflet + React Leaflet |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Notificaciones | React Hot Toast |
| Linting | ESLint + TypeScript ESLint |

---

## Arquitectura

El proyecto sigue una arquitectura **Clean Architecture / DDD** con tres capas bien diferenciadas:

```
src/
├── domain/          # Tipos, interfaces e interfaces de repositorio (sin dependencias externas)
├── application/     # Casos de uso — orquestan la lógica de negocio
├── infrastructure/  # Implementaciones concretas: APIs REST, sockets, persistencia local
└── ui/              # Componentes React, páginas, contextos, hooks
```

La capa `domain` no conoce ni Axios, ni Socket.IO, ni React. Esto facilita el testing y el reemplazo de implementaciones sin tocar la lógica de negocio.

---

## Roles y módulos

La aplicación gestiona cuatro roles con rutas y paneles propios:

### 👤 Cliente (rol 2)
- Exploración de tiendas y productos
- Carrito de compras y proceso de checkout
- Seguimiento de pedido en tiempo real (`/tracking/:orderId`)
- Historial de pedidos y pagos
- Favoritos y perfil personal

### 🏪 Negocio / Vendedor (rol 4) — `/vendor/dashboard`
- Panel principal con estadísticas
- Gestión de pedidos (aceptar / rechazar)
- Menú: catálogo y categorías de productos
- Gestión de domiciliarios afiliados y solicitudes
- Reportes y reseñas de clientes
- Configuración del negocio

### 🛵 Domiciliario / Courier (rol 3) — `/courier/dashboard`
- Pedidos disponibles para tomar
- Seguimiento activo con transmisión GPS en tiempo real
- Historial de entregas
- Estado de ganancias y balance
- Perfil y verificación de documentos

### 🔧 Administrador (roles 1 y 5) — `/admin/dashboard`
- Resumen general del sistema
- Gestión de usuarios y admins (SuperAdmin)
- Liquidaciones y reportes
- Logs de auditoría (SuperAdmin)
- Backups y archivos del sistema
- Índice de búsqueda

---

## Estructura del proyecto

```
src/
├── application/
│   └── use-cases/          # Un archivo por caso de uso (Login, CreateProduct, TakeOrder…)
│
├── domain/
│   ├── interfaces/         # Contratos de repositorios y gateways
│   ├── types/              # Tipos de dominio por entidad
│   └── utils/              # Utilidades puras (p.ej. validación de cédula)
│
├── infrastructure/
│   ├── api/                # Llamadas HTTP por dominio (authApi, productApi, ordersApi…)
│   ├── persistence/        # Persistencia local (localStorage)
│   ├── repositories/       # Implementaciones de los repositorios del dominio
│   ├── routing/            # Servicio de rutas OSRM
│   └── socket/             # Gateways de WebSocket (chat y tracking)
│
└── ui/
    ├── components/
    │   ├── chat/           # Ventana de chat entre usuarios
    │   ├── chatbot/        # Widget de asistente virtual
    │   ├── courier/        # Componentes del panel de domiciliarios
    │   ├── DeliveryMap/    # Mapas de entrega y tracking en vivo
    │   ├── layout/         # Layouts por rol (Admin, Courier, Vendor, público)
    │   ├── sections/       # Secciones de la página home
    │   ├── store/          # Detalle de tienda y modales de reseña
    │   ├── ui/             # Componentes genéricos (FormField, StoreCard, etc.)
    │   ├── vendor/         # Componentes del panel de negocio
    │   └── verification/   # Carga de documentos de identidad
    ├── context/            # Contextos globales: Auth, Cart, Favorites, DarkMode
    ├── hooks/              # Hooks personalizados (chat, tracking, notificaciones)
    ├── pages/              # Páginas agrupadas por módulo
    └── router/
        └── AppRouter.tsx   # Definición de todas las rutas
```

---

## Instalación y desarrollo

### Prerrequisitos

- Node.js ≥ 18
- npm ≥ 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores correspondientes

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# URL base del backend (REST + WebSockets)
VITE_API_URL=http://localhost:3000
```

> Todas las variables expuestas al cliente deben tener el prefijo `VITE_`.

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción (solo JS/CSS, sin type-check)
npm run build:check  # Build de producción con verificación de tipos TypeScript
npm run preview      # Previsualizar el build localmente
npm run lint         # Lint con ESLint
```

---

## Despliegue

El proyecto incluye configuración lista para **Vercel**:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

El rewrite `/*` → `/index.html` es necesario para que React Router funcione correctamente en producción con rutas anidadas.

Para desplegar en Vercel, simplemente conecta el repositorio y agrega la variable de entorno `VITE_API_URL` apuntando al backend de producción.