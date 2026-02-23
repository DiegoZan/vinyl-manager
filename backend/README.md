# Backend - Vinyl Manager

API REST para gestionar la coleccion de vinilos y la integracion con Discogs.

## Stack

- Node.js + Express 5
- SQLite3
- dotenv
- Vitest + Supertest

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear `backend/.env`:

```env
PORT=3000
DATABASE_PATH=./data/vinyl.db
DISCOGS_KEY=tu_discogs_key
DISCOGS_SECRET=tu_discogs_secret
DISCOGS_USER_AGENT=VinylManager/1.0 +tu_contacto
```

Notas:
- `PORT` es opcional (default `3000`).
- `DATABASE_PATH` es opcional. Si no existe, se crea automaticamente.
- `DISCOGS_*` solo son necesarias para endpoints de Discogs/importacion.

## Scripts

```bash
npm run dev    # nodemon src/server.js
npm start      # node src/server.js
npm test       # vitest
```

## Ejecucion local

```bash
npm run dev
```

Servidor por defecto: `http://localhost:3000`

Healthcheck:
- `GET /api/health` -> `{ "status": "ok" }`

## Arquitectura de carpetas

```text
backend/
|-- data/
|   `-- vinyl.db
|-- src/
|   |-- db/
|   |   |-- database.js
|   |   `-- schema.sql
|   |-- mappers/
|   |   `-- discogsRelease.mapper.js
|   |-- routes/
|   |   |-- collectionItems.routes.js
|   |   |-- releases.routes.js
|   |   `-- discogs.routes.js
|   |-- services/
|   |   |-- discogs.service.js
|   |   `-- discogsImport.service.js
|   |-- app.js
|   `-- server.js
|-- tests/
|   |-- helpers/testDb.js
|   `-- *.test.js
`-- package.json
```

## Endpoints

### Salud
- `GET /api/health`

### Collection Items
- `GET /api/collection-items?q=&status=&limit=&offset=`
- `PATCH /api/collection-items/:id/status`
- `PATCH /api/collection-items/:id`

`status` validos:
- `active`
- `sold`
- `lost`
- `broken`
- `traded`

Campos editables en `PATCH /api/collection-items/:id`:
- `mediaCondition` (Goldmine: `M`, `NM`, `VG+`, `VG`, `G+`, `G`, `F`, `P`)
- `sleeveCondition` (mismos valores)
- `location`
- `notes`
- `purchaseDate` (`YYYY-MM-DD`)
- `purchasePriceCents` (entero >= 0)
- `currency` (codigo de 3 letras)

### Releases
- `POST /api/releases/manual`
- `POST /api/releases/import/discogs/:discogsReleaseId`
- `GET /api/releases/:id`

`POST /api/releases/manual` requiere:
- `title` (string, obligatorio)
- `year` (opcional, entero entre 1800 y 3000)
- `coverImageUrl` (opcional)

### Discogs (proxy)
- `GET /api/discogs/search`
- `GET /api/discogs/releases/:id`

Busqueda Discogs soporta query params:
- `barcode`, `artist`, `title`, `catno`, `track`, `type`, `perPage`, `page`

## Base de datos

El esquema se inicializa automaticamente al arrancar (`src/db/schema.sql`).

Tablas principales:
- `releases`
- `collection_items`
- `artists` y `release_artists`
- `labels` y `release_labels`
- `tracks`
- `barcodes`
- `tags` y `collection_item_tags`

Detalles importantes:
- Foreign keys activadas (`PRAGMA foreign_keys = ON`).
- Triggers para actualizar `updated_at` en `releases` y `collection_items`.
- `discogs_release_id` es unico en `releases`.

## Importacion desde Discogs

Flujo interno:
1. Busca release en Discogs (`discogs.service.js`).
2. Normaliza datos (`discogsRelease.mapper.js`).
3. Importa en transaccion (`discogsImport.service.js`):
   - upsert de `releases`
   - replace de artistas, sellos, tracks y barcodes
   - crea `collection_item` en estado `active`

## Testing

Ejecutar:

```bash
npm test
```

Cobertura actual (tests existentes):
- healthcheck
- busqueda en coleccion
- cambio de estado de collection item
- edicion de campos de collection item
- alta manual + detalle de release
- mapper de Discogs

Los tests usan SQLite en memoria (`:memory:`) mediante `tests/helpers/testDb.js`.
