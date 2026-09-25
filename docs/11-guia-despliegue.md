# Guía de Despliegue — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

---

## 1. Objetivo

Desplegar StoreCore completo en un servidor Linux con Docker Compose, con HTTPS,
backup automático y un procedimiento de actualización y de restauración probados.

## 2. Arquitectura de Despliegue

```text
                          Internet
                             │
                    ┌────────▼────────┐
                    │  Let's Encrypt   │  Certificado TLS gratuito
                    └────────┬────────┘
                             │443 / 80
┌────────────────────────────▼──────────────────────────────────┐
│                    SERVIDOR VPS (Ubuntu 24.04)                  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Docker Compose: storecore                              │  │
│  │                                                          │  │
│  │  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐  │  │
│  │  │ web          │   │ api          │   │ postgres    │  │  │
│  │  │ nginx:alpine │──►│ nest:22-alp  │   │ pg:16-alp   │  │  │
│  │  │              │   │              │   │             │  │  │
│  │  │ :80 :443     │   │ :3000        │   │ :5432       │  │  │
│  │  │ serves SPA   │   │ REST API     │   │ datos       │  │  │
│  │  │ proxy /api   │   │ sin exponer  │   │ volumen     │  │  │
│  │  │ terminates   │   │ al exterior  │   │ persistente │  │  │
│  │  │ TLS         │   │              │   │             │  │  │
│  │  └──────────────┘   └──────────────┘   └─────────────┘  │  │
│  │                                                          │  │
│  │  red: storecore_net (bridge, interna)                     │  │
│  │  volumen: storecore_pgdata                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  /opt/storecore/          ← código y compose                  │
│  /opt/storecore/backups/  ← respaldos .sql.gz                  │
└────────────────────────────────────────────────────────────────┘
```

**Principio de seguridad:** solo el puerto 80 y el 443 están expuestos. La API y
la base de datos viven en la red interna de Docker y no son alcanzables desde
Internet.

## 3. Requisitos del Servidor

| Recurso           | Mínimo             | Recomendado      | Nota                                      |
| ----------------- | ------------------ | ---------------- | ----------------------------------------- |
| Sistema operativo | Ubuntu 22.04 LTS   | Ubuntu 24.04 LTS | Cualquier distribución con Docker         |
| CPU               | 2 vCPU             | 2 vCPU           | Para 1–2 usuarios concurrentes            |
| RAM               | 2 GB               | 4 GB             | PostgreSQL necesita memoria para el caché |
| Disco             | 20 GB              | 40 GB            | Base de datos + imágenes + respaldos      |
| Red               | IP pública o túnel | IP pública       | Necesaria para Let's Encrypt              |

## 4. Instalación Inicial del Servidor

### 4.1 Usuario no root (recomendado)

```bash
sudo adduser storecore
sudo usermod -aG sudo storecore
su - storecore
```

### 4.2 Docker y Compose

```bash
# Repositorio oficial de Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Sin sudo para el usuario del proyecto
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker --version
docker compose version
```

### 4.3 Zona horaria

```bash
sudo timedatectl set-timezone America/Mexico_City
```

### 4.4 Directorio del proyecto

```bash
sudo mkdir -p /opt/storecore/backups
sudo chown -R $USER:$USER /opt/storecore
cd /opt/storecore
```

## 5. Configuración

### 5.1 Archivo de variables de entorno

```bash
cp .env.example .env
nano .env
```

### 5.2 Variables de producción

| Variable               | Ejemplo                        | Descripción                         |
| ---------------------- | ------------------------------ | ----------------------------------- |
| `NODE_ENV`             | `production`                   | Modo de ejecución                   |
| `PORT`                 | `3000`                         | Puerto interno de la API            |
| `API_PREFIX`           | `api/v1`                       | Prefijo de las rutas                |
| `DATABASE_HOST`        | `postgres`                     | Nombre del servicio en Compose      |
| `DATABASE_PORT`        | `5432`                         | Puerto de PostgreSQL                |
| `DATABASE_NAME`        | `storecore`                    | Nombre de la base                   |
| `DATABASE_USER`        | `storecore`                    | Usuario de la base                  |
| `DATABASE_PASSWORD`    | `<secreto>`                    | **Contraseña fuerte. Nunca en Git** |
| `DATABASE_SYNCHRONIZE` | `false`                        | **Nunca `true` en producción**      |
| `JWT_SECRET`           | `<64 caracteres aleatorios>`   | **Secreto de firma. Nunca en Git**  |
| `JWT_EXPIRES_IN`       | `8h`                           | Duración de la sesión               |
| `CORS_ORIGIN`          | `https://pulperia.example.com` | Origen permitido, sin barra final   |
| `BCRYPT_ROUNDS`        | `12`                           | Rondas de hash                      |
| `LOG_LEVEL`            | `info`                         | Nivel de log                        |
| `VITE_API_URL`         | `/api/v1`                      | URL de la API desde el navegador    |

### 5.3 Generar los secretos

```bash
# Secreto JWT
openssl rand -base64 64

# Contraseña de la base de datos
openssl rand -base64 32
```

## 6. Despliegue

### 6.1 Obtener el código

```bash
cd /opt/storecore
git clone https://github.com/<cuenta>/storecore.git .
git checkout v1.0.0
```

### 6.2 Construir y levantar

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 6.3 Verificar

```bash
# Estado de los contenedores
docker compose -f docker-compose.prod.yml ps

# Logs de la API
docker compose -f docker-compose.prod.yml logs -f api

# Estado de salud
curl -k https://pulperia.example.com/api/v1/health
```

### 6.4 Resposta esperada

```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 42.3,
  "timestamp": "2026-09-25T18:30:00.000Z"
}
```

### 6.5 Migraciones y datos iniciales

Las migraciones se aplican automáticamente al arrancar la API, mediante un comando
de entrada. Para aplicarlas manualmente:

```bash
docker compose -f docker-compose.prod.yml exec api \
  pnpm --filter backend migration:run

# Datos iniciales (solo la primera vez)
docker compose -f docker-compose.prod.yml exec api \
  pnpm --filter backend seed:run
```

### 6.6 Crear el primer usuario administrador

```bash
docker compose -f docker-compose.prod.yml exec api \
  pnpm --filter backend user:create-admin
```

El comando solicita nombre de usuario, correo, contraseña, nombre completo y
sucursal.

## 7. Certificado TLS

El contenedor de Nginx incluye el cliente de Let's Encrypt. La emisión inicial:

```bash
docker compose -f docker-compose.prod.yml exec web certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --domain pulperia.example.com \
  --email admin@example.com \
  --agree-tos --no-eff-email
```

La renovación automática está configurada en el `cron` interno de la imagen de
Nginx. Verificar:

```bash
docker compose -f docker-compose.prod.yml exec web certbot renew --dry-run
```

## 8. Actualización a una Versión Nueva

```bash
cd /opt/storecore

# 1. Respaldo ANTES de actualizar
./scripts/backup.sh

# 2. Traer la versión nueva
git fetch --tags
git checkout v1.1.0

# 3. Reconstruir y reiniciar
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 4. Aplicar migraciones
docker compose -f docker-compose.prod.yml exec api \
  pnpm --filter backend migration:run

# 5. Verificar
curl -k https://pulperia.example.com/api/v1/health
docker compose -f docker-compose.prod.yml ps
```

> Las migraciones de una actualización son irreversibles hacia atrás. El paso 1 no
> es opcional: sin respaldo, no hay vuelta atrás.

## 9. Respaldo (Backup)

### 9.1 Script de respaldo

`/opt/storecore/scripts/backup.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/storecore/backups"
RETENTION_DAYS=14
STAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="storecore_${STAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

cd /opt/storecore
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U storecore -d storecore --clean --if-exists \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "Respaldo creado: ${FILENAME}"

# Rotación
find "$BACKUP_DIR" -name "storecore_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
```

```bash
chmod +x scripts/backup.sh
```

### 9.2 Programación diaria

```bash
crontab -e
```

```cron
# Respaldo diario a las 2:00 AM
0 2 * * * /opt/storecore/scripts/backup.sh >> /var/log/storecore-backup.log 2>&1
```

### 9.3 Restauración

```bash
cd /opt/storecore

# 1. Detener la API para que no escriba durante la restauración
docker compose -f docker-compose.prod.yml stop api

# 2. Restaurar desde el respaldo
gunzip -c backups/storecore_20260925_020000.sql.gz \
  | docker compose -f docker-compose.prod.yml exec -T postgres \
      psql -U storecore -d storecore

# 3. Volver a levantar
docker compose -f docker-compose.prod.yml up -d api

# 4. Verificar
curl -k https://pulperia.example.com/api/v1/health
```

> **La restauración debe probarse al menos una vez antes de declarar el sistema en
> producción.** Un respaldo no verificado no es un respaldo (RNF-16).

## 10. Operación Diaria

| Tarea             | Frecuencia   | Comando                                                         |
| ----------------- | ------------ | --------------------------------------------------------------- |
| Ver estado        | A diario     | `docker compose -f docker-compose.prod.yml ps`                  |
| Ver logs          | A diario     | `docker compose -f docker-compose.prod.yml logs --tail=100 api` |
| Reiniciar API     | Si hay error | `docker compose -f docker-compose.prod.yml restart api`         |
| Limpiar espacio   | Semanal      | `docker system prune -f`                                        |
| Revisar respaldos | Semanal      | `ls -lh /opt/storecore/backups`                                 |
| Verificar salud   | Semanal      | `curl -k https://dominio/api/v1/health`                         |

## 11. Diagnóstico de Problemas

| Síntoma                      | Causa probable                 | Solución                                                                   |
| ---------------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| El sitio no carga            | Nginx detenido                 | `docker compose -f docker-compose.prod.yml logs web`                       |
| Error 502 en `/api`          | Contenedor `api` caído         | `docker compose -f docker-compose.prod.yml restart api`                    |
| `ECONNREFUSED` a PostgreSQL  | Base de datos no lista         | `docker compose -f docker-compose.prod.yml ps postgres` y revisar `health` |
| Error de migración           | Esquema desactualizado         | `pnpm --filter backend migration:run` y revisar los logs                   |
| `JWT signature is invalid`   | `JWT_SECRET` cambió            | Restituir el valor anterior del `.env` y reiniciar                         |
| Sin acceso a datos           | `DATABASE_PASSWORD` incorrecta | Revisar `.env` y `docker compose ... logs api`                             |
| Disco lleno                  | Imágenes y respaldos antiguos  | `docker system prune -af` y revisar `/opt/storecore/backups`               |
| Contenedor reinicia en bucle | Falla en el arranque           | `docker compose -f docker-compose.prod.yml logs --tail=50 api`             |
| Puerto 80 ocupado            | Otro servicio en el servidor   | `sudo lsof -i :80` y detener el servicio en conflicto                      |
| Contenedor OOM               | Memoria insuficiente           | Aumentar RAM del VPS o bajar `shared_buffers` de PostgreSQL                |
| La venta tarda mucho         | Consulta sin índice            | Revisar `docker compose ... logs api` y el tiempo de respuesta en los logs |
| SSL expirado                 | Renovación fallida             | `certbot renew` y revisar el `cron` interno                                |

### 11.1 Comandos de diagnóstico útiles

```bash
# Estado detallado
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"

# Logs con marcas de tiempo
docker compose -f docker-compose.prod.yml logs -f --timestamps api

# Entrar al contenedor
docker compose -f docker-compose.prod.yml exec api sh

# Consumir memoria y disco
docker stats --no-stream
df -h

# Conexión manual a PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U storecore -d storecore

# Ver las últimas migraciones aplicadas
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U storecore -d storecore -c "SELECT * FROM migrations ORDER BY id DESC LIMIT 5;"
```

## 12. Variables de Entorno para el Navegador

El frontend llama a la API a través de Nginx, sin exponer el puerto de la API:

```env
VITE_API_URL=/api/v1
```

En Nginx, `/api/` se redirige al servicio `api:3000`.

## 13. Lista de Verificación de Despliegue

- [ ] `docker --version` y `docker compose version` funcionan
- [ ] La zona horaria es `America/Mexico_City`
- [ ] `.env` existe con todos los valores y con secretos nuevos
- [ ] `DATABASE_SYNCHRONIZE=false`
- [ ] `JWT_SECRET` tiene al menos 64 caracteres
- [ ] `CORS_ORIGIN` coincide exactamente con el dominio
- [ ] `docker compose -f docker-compose.prod.yml build` termina sin errores
- [ ] Los tres contenedores están en estado `healthy`
- [ ] `/api/v1/health` responde con estado correcto
- [ ] Las migraciones se aplicaron
- [ ] El administrador se creó
- [ ] El certificado TLS está emitido
- [ ] La renovación de TLS funciona
- [ ] El respaldo se programó en `cron`
- [ ] **La restauración se probó al menos una vez**
- [ ] El acceso desde el navegador funciona en los cuatro navegadores objetivo
