# API REST con autenticación JWT

![CI](https://github.com/JasonOspina07/api-rest-portafolio/actions/workflows/ci.yml/badge.svg)

API RESTful construida con Node.js, Express y PostgreSQL que implementa registro, login y rutas protegidas con JWT. Incluye tests automatizados, integración continua con GitHub Actions, contenedor Docker y despliegue en producción.

## 🚀 Demo en vivo

**API desplegada:** https://api-rest-portafolio-7egh.onrender.com

> ⏳ Está en el plan gratuito de Render: si lleva un rato sin uso, la primera petición puede tardar hasta ~1 minuto en responder mientras el servicio despierta.

Prueba rápida (PowerShell):

```powershell
Invoke-RestMethod https://api-rest-portafolio-7egh.onrender.com
```

## Tecnologías

- **Node.js** + **Express 5** — Servidor y rutas
- **PostgreSQL** (Supabase) — Base de datos relacional
- **Prisma** — ORM para manejo de base de datos
- **JWT** — Autenticación con tokens (expiran en 24 h)
- **bcryptjs** — Encriptación de contraseñas
- **Jest** + **Supertest** — Tests unitarios y de integración
- **Docker** — Imagen multi-stage con usuario sin privilegios
- **GitHub Actions** — CI con Postgres temporal y build de Docker
- **Render** — Despliegue

## Endpoints

### Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/users/register | Registrar usuario |
| POST | /api/users/login | Iniciar sesión |

### Protegidos (requieren token JWT)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/users/profile | Ver perfil del usuario |

### Códigos de respuesta

| Código | Cuándo ocurre |
|--------|---------------|
| 201 | Usuario registrado |
| 200 | Login o perfil correctos |
| 400 | Faltan campos, contraseña de menos de 6 caracteres o email ya registrado |
| 401 | Credenciales incorrectas, token ausente, inválido o expirado |
| 500 | Error interno del servidor |

## Uso de la API

### Registrar usuario

```
POST /api/users/register
```

```json
{
  "name": "Jason",
  "email": "jason@gmail.com",
  "password": "123456"
}
```

Respuesta `201`:

```json
{
  "message": "Usuario registrado exitosamente",
  "user": { "id": 1, "name": "Jason", "email": "jason@gmail.com" }
}
```

### Login

```
POST /api/users/login
```

```json
{
  "email": "jason@gmail.com",
  "password": "123456"
}
```

Respuesta `200`:

```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Jason", "email": "jason@gmail.com" }
}
```

### Ver perfil (con token)

```
GET /api/users/profile
Authorization: Bearer tu_token_jwt
```

Respuesta `200`:

```json
{
  "user": {
    "id": 1,
    "name": "Jason",
    "email": "jason@gmail.com",
    "createdAt": "2026-10-15T00:00:00.000Z"
  }
}
```

## Instalación local

1. Clona el repositorio

```bash
git clone https://github.com/JasonOspina07/api-rest-portafolio.git
cd api-rest-portafolio
```

2. Instala las dependencias

```bash
npm install
```

3. Configura las variables de entorno

```bash
cp .env.example .env
```

4. Sincroniza la base de datos y genera el cliente de Prisma

```bash
npx prisma db push
npx prisma generate
```

5. Inicia el servidor

```bash
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Clave para firmar los tokens. Usa una larga y aleatoria |

## Tests

El proyecto incluye **21 tests** (unitarios + integración):

```bash
npm test
```

- **Unitarios** (`tests/unit`): middleware de autenticación y controlador, con Prisma mockeado.
- **Integración** (`tests/integration`): flujo completo de registro, login y ruta protegida contra una base de datos PostgreSQL real.

Los tests de integración crean y borran usuarios, así que necesitan una base **separada** de la de desarrollo. Define su `DATABASE_URL` en un archivo `.env.test` (ignorado por Git) y corre:

```bash
npx dotenv -e .env.test -- npx jest
```

## Integración continua

Cada push a `main` ejecuta un workflow de GitHub Actions con dos jobs:

1. **test**: levanta un PostgreSQL temporal, sincroniza el esquema y corre los 21 tests.
2. **docker**: construye la imagen para verificar que no se rompió.

## 🐳 Correr con Docker

```bash
docker build -t api-rest-portafolio .
docker run -p 3000:3000 --env-file .env api-rest-portafolio
```

La API estará disponible en `http://localhost:3000`.

La imagen usa un build multi-stage sobre `node:24-slim` y corre como usuario sin privilegios de root.