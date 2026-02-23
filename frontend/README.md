# Frontend - Vinyl Manager

Cliente web de Vinyl Manager construido con React + Vite + MUI.

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en `frontend/` (puedes copiar `.env.example`):

```env
VITE_API_BASE_URL=/api
```

- Valor por defecto en codigo: `/api`.
- En desarrollo, Vite hace proxy de `/api` a `http://localhost:3000` (ver `vite.config.js`).

## Scripts

```bash
npm run dev      # inicia Vite en desarrollo
npm run build    # genera build de produccion
npm run preview  # previsualiza build local
npm run lint     # ejecuta ESLint
npm test         # ejecuta Vitest
```

## Rutas de la aplicacion

- `/` -> vista de coleccion
- `/releases/:id` -> detalle de release y copias asociadas

## Funcionalidades implementadas

- Listado de coleccion con filtros por estado y busqueda.
- Importacion desde Discogs desde dialogo (barcode, artista+titulo, catno).
- Vista de detalle con tracklist, artistas, labels y barcodes.
- Edicion de estado de copia (`active`, `sold`, `lost`, `broken`, `traded`).
- Edicion de metadatos de copia (ubicacion, condiciones, compra, notas).
- Tema claro/oscuro persistido en `localStorage`.

## Estructura relevante

```text
frontend/
|-- src/
|   |-- api/
|   |   |-- httpClient.js
|   |   |-- releasesApi.js
|   |   `-- discogsApi.js
|   |-- components/
|   |   `-- AboutDialog/
|   |-- pages/
|   |   |-- Collection/
|   |   |-- ReleaseCard/
|   |   `-- ReleaseDetails/
|   |-- routes/
|   |   `-- AppRoutes.jsx
|   |-- tests/
|   |   `-- setupTests.js
|   |-- App.jsx
|   `-- main.jsx
|-- .env.example
|-- vite.config.js
|-- vitest.config.js
`-- package.json
```

## API consumida por el frontend

Las llamadas se centralizan en `src/api/httpClient.js` usando `VITE_API_BASE_URL`.

Endpoints usados:
- `GET /collection-items`
- `PATCH /collection-items/:id/status`
- `PATCH /collection-items/:id`
- `GET /releases/:id`
- `POST /releases/manual`
- `POST /releases/import/discogs/:discogsReleaseId`
- `GET /discogs/search`

## Testing

- Framework: Vitest + Testing Library + jsdom.
- Setup global: `src/tests/setupTests.js`.
- Ejemplo actual: test del dialogo de importacion en `src/pages/Collection/ImportFromDiscogsDialog.component.test.jsx`.

## Desarrollo local recomendado

Con backend levantado en paralelo:

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Frontend disponible en `http://localhost:5173`.
