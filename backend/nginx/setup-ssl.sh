#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Setup SSL con Let's Encrypt + Certbot para UrbanRush
# ═══════════════════════════════════════════════════════════════
# Ejecutar como root en el servidor de producción.
# Reemplazar "tu-dominio.com" por el dominio real.
# ═══════════════════════════════════════════════════════════════

set -e

DOMAIN="tu-dominio.com"
EMAIL="admin@tu-dominio.com"

echo "══════════════════════════════════════"
echo " UrbanRush — Setup SSL/HTTPS"
echo "══════════════════════════════════════"

# 1. Instalar Nginx y Certbot
echo "→ Instalando Nginx y Certbot..."
apt update
apt install -y nginx certbot python3-certbot-nginx

# 2. Crear directorio para Certbot challenge
mkdir -p /var/www/certbot

# 3. Copiar configuración de Nginx (temporal sin SSL para obtener el certificado)
cat > /etc/nginx/sites-available/urbanrush << 'NGINX_TEMP'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'UrbanRush OK';
        add_header Content-Type text/plain;
    }
}
NGINX_TEMP

# Reemplazar placeholder con dominio real
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/urbanrush

# Activar sitio
ln -sf /etc/nginx/sites-available/urbanrush /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 4. Obtener certificado SSL con Certbot
echo "→ Obteniendo certificado SSL..."
certbot certonly --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --non-interactive

# 5. Copiar configuración de Nginx final (con SSL)
echo "→ Configurando Nginx con SSL..."
cp nginx.conf /etc/nginx/sites-available/urbanrush
sed -i "s/tu-dominio.com/$DOMAIN/g" /etc/nginx/sites-available/urbanrush
nginx -t && systemctl reload nginx

# 6. Configurar renovación automática con cron
echo "→ Configurando renovación automática..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

# 7. Verificar
echo ""
echo "══════════════════════════════════════"
echo " ✅ SSL configurado correctamente"
echo " → https://$DOMAIN"
echo " → Renovación automática: 3:00 AM diario"
echo "══════════════════════════════════════"
