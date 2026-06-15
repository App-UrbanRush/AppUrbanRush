# UrbanRush Mobile

App móvil de UrbanRush en **React Native + Expo (TypeScript)**.

Es el segundo frontend del proyecto. Consume **los dos backends**:

- **Backend 1 — NestJS (`:3000`)** → lógica de negocio: login, tiendas, productos, pedidos.
- **Backend 2 — FastAPI (`:8000`)** → analítica / inteligencia: estimación de tiempo de entrega, sentimiento de reseñas, etc.

## Pantallas

| Pantalla | Backend 1 (Nest) | Backend 2 (FastAPI) |
|---|---|---|
| Login | `POST /auth/login` | — |
| Tiendas | `GET /vendors` | `POST /delivery-time/estimate` por cada tienda |
| Detalle de tienda | `GET /products/vendor/:id` | `GET /sentiment/vendor/:id/report` |
| Mis pedidos | `GET /orders/user/:id` | — |
| Inteligencia (IA) | — | `POST /delivery-time/estimate`, `POST /sentiment/analyze` |

## Cómo correrla

```bash
cd mobile
npm install
npx expo start
```

Después tenés tres opciones:

- **Celular físico**: descargá la app **Expo Go** y escaneá el QR del terminal. Antes, abrí [`src/config/env.ts`](src/config/env.ts) y descomentá `const host = LAN_IP;`, ajustando `LAN_IP` a la IP de tu PC en la red (ej. `192.168.1.42`).
- **Emulador Android**: presioná `a` en el terminal de Expo. Las URLs ya están configuradas con `10.0.2.2` para que el emulador alcance los backends locales.
- **Simulador iOS** (solo Mac): presioná `i`.

## Antes de probar

Asegurate de tener corriendo:

1. **NestJS** en `:3000`
   ```bash
   cd backend && npm run start:dev
   ```
2. **FastAPI** en `:8000`
   ```bash
   cd urbanrush-fastapi && uvicorn app.main:app --reload --port 8000
   ```
