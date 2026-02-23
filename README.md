# 🎵 Vinyl Collection Manager

## 1. Descripción del Proyecto

**Vinyl Collection Manager** es una aplicación web diseñada para registrar, organizar y consultar una colección personal de discos de vinilo.

La aplicación permite mantener un inventario estructurado de discos físicos, consultarlos fácilmente mediante búsquedas avanzadas, y enriquecer automáticamente la información utilizando la API pública de Discogs.

El sistema está pensado como una herramienta personal, pero con una arquitectura lo suficientemente robusta como para escalar a múltiples usuarios si fuera necesario.

---

## 2. Objetivos del Proyecto

- Centralizar la información de una colección personal de vinilos.
- Evitar duplicados involuntarios.
- Facilitar la búsqueda rápida dentro de la colección.
- Enriquecer automáticamente los datos mediante integración con Discogs.
- Mantener historial de estado del disco (vendido, roto, perdido, etc.).
- Servir como proyecto demostrativo de arquitectura moderna full-stack.

---

## 3. Funcionalidades Principales

### 📀 3.1 Gestión de Colección

- Visualización de todos los discos en la colección.
- Vista tipo grid con:
  - Tapa principal (cover art)
  - Artista
  - Título
  - Año
  - Sello discográfico
  - Número de catálogo
- Vista detallada del disco con:
  - Tracklist completa
  - Géneros y estilos
  - Formato (LP, EP, 7", 12", etc.)
  - País
  - Notas adicionales
  - Estado del disco

---

### 🔎 3.2 Búsqueda Avanzada

Búsqueda dinámica por:

- Artista
- Título
- Año
- Canción (tracklist)
- Sello
- Número de catálogo
- Código de barras

Filtros por:

- Estado (activo, vendido, perdido, roto)
- Género
- Año
- Formato

---

### ➕ 3.3 Alta de Nuevos Discos

Un disco puede agregarse de dos maneras:

#### 1. Manual

Ingresando los datos básicos manualmente.

#### 2. Automática (Integración con Discogs API)

Se podrá obtener información ingresando:

- Código de barras
- Artista + título
- Número de catálogo

El sistema consultará la API de Discogs y permitirá:

- Seleccionar la versión correcta
- Importar automáticamente:
  - Cover
  - Tracklist
  - Año
  - Géneros
  - Sello
  - País
  - Formato

---

### 🗂 3.4 Estados del Disco (Soft Delete)

Los discos **no se eliminan físicamente** de la base de datos.

En su lugar pueden marcarse como:

- Activo
- Vendido
- Perdido
- Roto
- Intercambiado

Esto permite:

- Mantener historial
- Generar estadísticas
- Restaurar discos marcados incorrectamente

---

### 📊 3.5 Estadísticas (Funcionalidad adicional sugerida)

- Total de discos
- Distribución por género
- Distribución por década
- Distribución por formato
- Sello más frecuente
- País más frecuente

---

### 💾 3.6 Exportación / Backup

- Exportación de la colección en JSON
- Restauración desde JSON
- Posible futura exportación CSV

---

### 🚀 3.7 Funcionalidades futuras (extensibles)

- Etiquetas personalizadas (tags)
- Ubicación física (estantería, caja, etc.)
- Valor estimado
- Modo oscuro
- Detección de posibles duplicados
- Soporte multiusuario
- Dashboard de resumen

---

## 4. Arquitectura del Sistema

El sistema está compuesto por cuatro componentes principales:

### 4.1 Frontend

- React (Vite)
- UI basada en Material UI
- Comunicación con backend vía REST API
- Renderizado de imágenes y datos estructurados

El frontend es servido como contenido estático por Nginx.

---

### 4.2 Backend

- Node.js
- Express
- API REST
- Integración con API externa de Discogs
- Lógica de negocio y persistencia

Responsabilidades:

- CRUD de discos
- Gestión de estados
- Búsquedas y filtros
- Proxy seguro hacia Discogs (oculta token)
- Validación de datos

---

### 4.3 Base de Datos

- SQLite
- Base de datos local en el VPS
- Persistencia mediante archivo `vinyl.db`

Ventajas:

- No requiere servidor adicional
- Simple de mantener
- Suficiente para uso personal o pequeño grupo

---

### 4.4 Servidor Web / Reverse Proxy

- Nginx
- Sirve archivos estáticos del frontend
- Proxy inverso hacia `/api` → Node+Express
- Gestión de HTTPS

---

## 5. Diagrama de Arquitectura

```mermaid
flowchart LR
    User[Usuario Navegador]

    subgraph VPS
        Nginx[Nginx Reverse Proxy]
        React[Frontend React\n(Archivos estáticos)]
        API[Node + Express API]
        DB[(SQLite Database\nvinyl.db)]
    end

    Discogs[(Discogs API)]

    User -->|HTTPS| Nginx
    Nginx -->|Static Files| React
    Nginx -->|/api/* Proxy| API
    API -->|SQL Queries| DB
    API -->|REST Request| Discogs
```

---

## 6. Flujo básico de operación

1️⃣ Visualización

Usuario → React → /api/releases → SQLite → datos devueltos → render en UI.

2️⃣ Alta con Discogs

Usuario → React → /api/discogs/search → Backend → Discogs API → datos → React → Confirmación → /api/releases → SQLite.

---

## 7. Estructura general del proyecto

```
vinyl-manager/
│
├── frontend/
│   ├── src/
│   └── dist/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── db/
│
└── nginx/
    └── config
```

---

## 8. Stack tecnológico

- React
- Vite + Vitest
- Material UI
- Node.js
- Express
- SQLite
- Nginx
- Discogs API
