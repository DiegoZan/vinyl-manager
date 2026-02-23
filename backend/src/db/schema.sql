PRAGMA foreign_keys = ON;

-- =========================================================
-- Core: Releases (Discogs + manual)
-- =========================================================

CREATE TABLE IF NOT EXISTS releases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  discogs_release_id INTEGER UNIQUE,
  discogs_master_id INTEGER,

  title TEXT NOT NULL,
  year INTEGER,
  country TEXT,
  format TEXT,
  genres TEXT,
  styles TEXT,

  label_main TEXT,
  catno_main TEXT,

  cover_image_url TEXT,
  resource_url TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_releases_title ON releases(title);
CREATE INDEX IF NOT EXISTS idx_releases_year ON releases(year);
CREATE INDEX IF NOT EXISTS idx_releases_discogs_release_id ON releases(discogs_release_id);
CREATE INDEX IF NOT EXISTS idx_releases_discogs_master_id ON releases(discogs_master_id);

-- =========================================================
-- Collection items (your physical copies)
-- =========================================================

CREATE TABLE IF NOT EXISTS collection_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  release_id INTEGER NOT NULL,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'sold', 'lost', 'broken', 'traded')),

  media_condition TEXT,
  sleeve_condition TEXT,
  purchase_date TEXT,
  purchase_price_cents INTEGER,
  currency TEXT,
  location TEXT,
  notes TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_collection_items_release_id ON collection_items(release_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_status ON collection_items(status);

-- =========================================================
-- Artists
-- =========================================================

CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS release_artists (
  release_id INTEGER NOT NULL,
  artist_id INTEGER NOT NULL,
  role TEXT,
  position INTEGER,

  PRIMARY KEY (release_id, artist_id),
  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_release_artists_release_id ON release_artists(release_id);

-- =========================================================
-- Labels
-- =========================================================

CREATE TABLE IF NOT EXISTS labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS release_labels (
  release_id INTEGER NOT NULL,
  label_id INTEGER NOT NULL,
  catno TEXT NOT NULL DEFAULT '',
  position INTEGER,

  PRIMARY KEY (release_id, label_id, catno),
  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_labels_name ON labels(name);
CREATE INDEX IF NOT EXISTS idx_release_labels_release_id ON release_labels(release_id);
CREATE INDEX IF NOT EXISTS idx_release_labels_catno ON release_labels(catno);

-- =========================================================
-- Tracks
-- =========================================================

CREATE TABLE IF NOT EXISTS tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  release_id INTEGER NOT NULL,

  position TEXT,
  title TEXT NOT NULL,
  duration TEXT,
  track_index INTEGER,

  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tracks_release_id ON tracks(release_id);
CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);

-- =========================================================
-- Barcodes
-- =========================================================

CREATE TABLE IF NOT EXISTS barcodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  release_id INTEGER NOT NULL,
  value TEXT NOT NULL,

  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_barcodes_release_value ON barcodes(release_id, value);
CREATE INDEX IF NOT EXISTS idx_barcodes_value ON barcodes(value);

-- =========================================================
-- Tags
-- =========================================================

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS collection_item_tags (
  collection_item_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,

  PRIMARY KEY (collection_item_id, tag_id),
  FOREIGN KEY (collection_item_id) REFERENCES collection_items(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- =========================================================
-- updated_at triggers
-- =========================================================

CREATE TRIGGER IF NOT EXISTS trg_releases_updated_at
AFTER UPDATE ON releases
FOR EACH ROW
BEGIN
  UPDATE releases SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_collection_items_updated_at
AFTER UPDATE ON collection_items
FOR EACH ROW
BEGIN
  UPDATE collection_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;