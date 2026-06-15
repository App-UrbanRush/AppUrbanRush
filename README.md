# UrbanRush

Plataforma integral para gestión de servicios logísticos, entregas y optimización mediante Inteligencia Artificial.

## 📋 Arquitectura del Proyecto
El proyecto se divide en tres módulos principales:
- **`backend/`**: API principal (NestJS) que maneja la lógica de negocio, autenticación y bases de datos.
- **`urbanrush-fastapi/`**: Microservicio para procesamiento de IA (FastAPI).
- **`Frontend/`**: Interfaz de usuario (React + Vite).

## 🛠️ Requisitos previos
- Node.js (v18+)
- Docker & Docker Desktop

## 🚀 Cómo ejecutar el proyecto

### Opción A: Usando Docker (Recomendado)
Para levantar todo el entorno de servicios de forma unificada:
1. Asegúrate de tener los archivos `.env` configurados en cada carpeta.
2. Ejecuta desde la raíz:
   ```bash
   docker-compose up -d --build


### Ejecución en desarrollo local
Si prefieres correr los servicios manualmente:
Backend: cd backend | npm install --legacy-peer-deps | npm run start:dev
FastAPI: cd urbanrush-fastapi | pip install -r requirements.txt | uvicorn main:app --reload
Frontend: cd Frontend | npm install | npm run dev

### Configuración de Entorno (Templates)
Crea un archivo .env en cada carpeta correspondiente usando los valores de ejemplo de .env.example del backed, frontend y urbanrush-fastapi

### Solución de Problemas Comunes
Error Auth Postgres (Docker): Si recibes password authentication failed, limpia los volúmenes con docker volume prune -f y vuelve a levantar el proyecto.

Error npm: Si npm install falla, usa siempre: npm install --legacy-peer-deps.

400 Bad Request: Verifica los logs del backend con docker logs -f app_backend para ver el error de validación detallado.


### Estructura
AppUrbanRush/
├── backend/            # API NestJS
├── urbanrush-fastapi/  # Microservicio IA
├── Frontend/           # React App
├── mobile/          
├── docker-compose.apps.yml
└── README.md







