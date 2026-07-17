# API REST con autenticación JWT

API RESTful construida con Node.js, Express y PostgreSQL que implementa autenticación segura con JWT.

## Tecnologías

- **Node.js** + **Express** — Servidor y rutas
- **PostgreSQL** — Base de datos relacional
- **Prisma** — ORM para manejo de base de datos
- **JWT** — Autenticación con tokens
- **Bcrypt** — Encriptación de contraseñas

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

## Instalación

1. Clona el repositorio
\```bash
git clone https://github.com/JasonOspina07/api-rest-portafolio.git
cd api-rest-portafolio
\```

2. Instala las dependencias
\```bash
npm install
\```

3. Configura las variables de entorno
\```bash
cp .env.example .env
\```

4. Genera el cliente de Prisma
\```bash
npx prisma generate
\```

5. Inicia el servidor
\```bash
npm run dev
\```

## Variables de entorno

Crea un archivo `.env` con estas variables:

\```
PORT=3000
DATABASE_URL=tu_url_de_postgresql
JWT_SECRET=tu_clave_secreta
\```

## Uso de la API

### Registrar usuario
\```json
POST /api/users/register
{
  "name": "Jason",
  "email": "jason@gmail.com",
  "password": "123456"
}
\```

### Login
\```json
POST /api/users/login
{
  "email": "jason@gmail.com",
  "password": "123456"
}
\```

### Ver perfil (con token)
\```
GET /api/users/profile
Authorization: Bearer tu_token_jwt
\```
![CI](https://github.com/JasonOspina07/api-rest-portafolio/actions/workflows/ci.yml/badge.svg)