# Configuración SSL/HTTPS para UrbanRush

## Requisitos
- Servidor Ubuntu 20.04+ con IP pública
- Dominio apuntando al servidor (DNS A record)
- Puertos 80 y 443 abiertos

## Setup rápido

```bash
# 1. Clonar repo en el servidor
git clone <repo> /opt/urbanrush
cd /opt/urbanrush/backend

# 2. Editar el script con tu dominio
nano nginx/setup-ssl.sh
# Cambiar DOMAIN="tu-dominio.com" y EMAIL="admin@tu-dominio.com"

# 3. Ejecutar setup
chmod +x nginx/setup-ssl.sh
sudo bash nginx/setup-ssl.sh

# 4. Configurar variables de entorno
cp .env.production.example .env
nano .env
# Rellenar TODAS las variables con valores de producción
# IMPORTANTE: CORS_ORIGINS=https://tu-dominio.com

# 5. Instalar dependencias y compilar
npm install
npm run build

# 6. Iniciar con PM2
npm install -g pm2
pm2 start dist/main.js --name urbanrush-api
pm2 save
pm2 startup
```

## Qué incluye la configuración de Nginx

### Redirección HTTP → HTTPS
Todo el tráfico en puerto 80 se redirige automáticamente a HTTPS (301).

### Headers de seguridad
| Header | Valor | Propósito |
|--------|-------|-----------|
| Strict-Transport-Security | max-age=31536000 | Forzar HTTPS por 1 año (HSTS) |
| X-Frame-Options | SAMEORIGIN | Prevenir clickjacking |
| X-Content-Type-Options | nosniff | Prevenir MIME sniffing |
| X-XSS-Protection | 1; mode=block | Prevenir XSS |
| Referrer-Policy | strict-origin-when-cross-origin | Controlar referrer |

### Proxy reverso
| Ruta | Destino | Servicio |
|------|---------|----------|
| /api/* | localhost:3000 | NestJS API |
| /fastapi/* | localhost:8000 | FastAPI (IA) |
| /health | localhost:3000/health | Health check |

### SSL
- Certificado: Let's Encrypt (Certbot)
- Protocolos: TLSv1.2, TLSv1.3
- Renovación automática: cron a las 3:00 AM

## Renovar certificado manualmente

```bash
sudo certbot renew --dry-run  # Prueba
sudo certbot renew             # Renovar
sudo systemctl reload nginx
```

## Verificar SSL

```bash
# Verificar que HTTPS funciona
curl -I https://tu-dominio.com/health

# Verificar headers de seguridad
curl -sI https://tu-dominio.com | grep -E "(Strict|X-Frame|X-Content|X-XSS)"

# Test SSL en línea
# https://www.ssllabs.com/ssltest/
```

## Cambios en NestJS para producción

- **CORS**: se lee de `CORS_ORIGINS` en `.env` (separados por coma)
- **Swagger**: deshabilitado cuando `NODE_ENV=production`
- **Trust proxy**: habilitado para leer `X-Forwarded-*` de Nginx
- **Health check**: `GET /health` retorna status, uptime y environment
