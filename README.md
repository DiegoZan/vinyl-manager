# Vinyl Manager

Aplicacion full-stack para gestionar una coleccion de vinilos. Permite buscar en la coleccion, importar lanzamientos desde Discogs y editar el estado/metadatos de cada copia fisica.

## Caracteristicas actuales

- Listado de la coleccion con filtros por estado y busqueda libre.
- Busqueda local por titulo, artista, track, catalogo y codigo de barras.
- Importacion desde Discogs (por codigo de barras, artista+titulo o numero de catalogo).
- Vista de detalle de release con artistas, sellos, tracklist, barcodes y copias asociadas.
- Edicion de estado de copia (`active`, `sold`, `lost`, `broken`, `traded`).
- Edicion de metadatos de copia: ubicacion, condiciones Goldmine, fecha/importe de compra, moneda y notas.
- Tema claro/oscuro en frontend.

## Stack tecnologico

- Frontend: React 19, Vite, React Router, MUI.
- Backend: Node.js, Express 5, SQLite3.
- Testing: Vitest (frontend y backend) + Supertest (backend).
- Integracion externa: Discogs API.

## Estructura del proyecto

```text
vinyl-manager/
|-- backend/
|   |-- data/
|   |   `-- vinyl.db
|   |-- src/
|   |   |-- db/
|   |   |-- mappers/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- app.js
|   |   `-- server.js
|   |-- tests/
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- routes/
|   |   `-- App.jsx
|   |-- .env.example
|   `-- package.json
`-- README.md
```

## Requisitos

- Node.js 20+ (recomendado).
- npm 10+.

## Configuracion de entorno

### Backend (`backend/.env`)

Variables usadas por el servidor:

```env
PORT=3000
DATABASE_PATH=./data/vinyl.db
DISCOGS_KEY=tu_discogs_key
DISCOGS_SECRET=tu_discogs_secret
DISCOGS_USER_AGENT=VinylManager/1.0 +tu_correo_o_url
```

Notas:
- `DATABASE_PATH` es opcional. Si no se define, usa `backend/data/vinyl.db`.
- `DISCOGS_*` son necesarias para endpoints de Discogs/importacion.

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=/api
```

- En desarrollo, Vite ya trae proxy de `/api` a `http://localhost:3000`.
- Si cambias host/puerto de backend, ajusta `VITE_API_BASE_URL` o `vite.config.js`.

## Instalacion

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Ejecucion en desarrollo

Abrir dos terminales:

```bash
# Terminal 1: backend
cd backend
npm run dev
```

```bash
# Terminal 2: frontend
cd frontend
npm run dev
```

Servicios por defecto:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Healthcheck: `GET http://localhost:3000/api/health`

## Scripts disponibles

### Backend

```bash
cd backend
npm run dev      # nodemon src/server.js
npm start        # node src/server.js
npm test         # vitest
```

### Frontend

```bash
cd frontend
npm run dev      # vite
npm run build    # build de produccion
npm run preview  # vista previa del build
npm run lint     # eslint
npm test         # vitest
```

## API (resumen)

### Salud
- `GET /api/health`

### Coleccion
- `GET /api/collection-items?q=&status=&limit=&offset=`
- `PATCH /api/collection-items/:id/status`
- `PATCH /api/collection-items/:id`

### Releases
- `POST /api/releases/manual`
- `POST /api/releases/import/discogs/:discogsReleaseId`
- `GET /api/releases/:id`

### Discogs (proxy backend)
- `GET /api/discogs/search`
- `GET /api/discogs/releases/:id`

## Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Estado actual

El proyecto esta orientado a uso local/persona y persistencia en SQLite. La importacion desde Discogs y la gestion de estados/metadata de copias ya estan implementadas y cubiertas con tests basicos en backend.
