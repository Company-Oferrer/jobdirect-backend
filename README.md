# Job Board Backend

Backend mínimo con Node.js, Express y Postgres que expone un endpoint `/api/jobs`
que retorna un listado de ofertas de trabajo en el siguiente formato:

```json
{
  "id": "1",
  "title": "Senior Frontend Engineer",
  "company": "BlueWave Tech",
  "region": "Lima",
  "category": "Technology",
  "type": "Full Time",
  "postedAt": "2025-11-10T09:00:00.000Z",
  "salaryRange": "$4,000 – $5,500",
  "shortDescription": "Lead the frontend of our SaaS analytics platform using React and TypeScript.",
  "description": "We are looking for a Senior Frontend Engineer to own the user interface of our analytics platform...",
  "tags": ["React", "TypeScript", "SaaS", "Leadership"]
}
```

## Requisitos

- Node.js >= 18
- Una base de datos Postgres accesible

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

2. Edita `.env` y ajusta `DATABASE_URL` (o las variables `DB_HOST`, `DB_USER`, etc.)
   con tus credenciales de Postgres.

3. Crea la tabla y datos de ejemplo en tu base de datos:

```bash
psql "$DATABASE_URL" -f schema.sql
```

> Ajusta el comando según cómo te conectes normalmente a Postgres.

## Ejecutar el servidor

Modo normal:

```bash
npm start
```

Modo desarrollo (con `nodemon`):

```bash
npm run dev
```

El servidor se levantará por defecto en `http://localhost:3000`.

## Endpoints

### `GET /api/health`

Endpoint simple para comprobar que el servidor está vivo.

**Respuesta de ejemplo:**

```json
{ "status": "ok" }
```

### `GET /api/jobs`

Devuelve el listado de ofertas de trabajo.

**Ejemplo de respuesta:**

```json
[
  {
    "id": "1",
    "title": "Senior Frontend Engineer",
    "company": "BlueWave Tech",
    "region": "Lima",
    "category": "Technology",
    "type": "Full Time",
    "postedAt": "2025-11-10T09:00:00.000Z",
    "salaryRange": "$4,000 – $5,500",
    "shortDescription": "Lead the frontend of our SaaS analytics platform using React and TypeScript.",
    "description": "We are looking for a Senior Frontend Engineer to own the user interface of our analytics platform. You will work closely with designers and backend engineers to ship high-quality, performant experiences. Responsibilities include building reusable components, ensuring accessibility, and collaborating on architectural decisions.",
    "tags": ["React", "TypeScript", "SaaS", "Leadership"]
  }
]
```

## Notas

- El rango salarial se arma a partir de `salary_min`, `salary_max` y `salary_currency`
  en la base de datos.
- La columna `tags` es un arreglo de texto (`TEXT[]`) en Postgres.
