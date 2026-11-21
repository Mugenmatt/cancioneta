-- ESQUEMA PRELIMINAR de la base final (NO se construye todavía).
-- Principios: (1) lema, categoría, acepción y forma flexionada son entidades distintas;
-- (2) los IDs nunca se reutilizan ni cambian; fusiones y bajas se registran en lemma_alias;
-- (3) cada fila de contenido apunta a su fuente (source_id) para poder exportar por fuente
--     y respetar licencias distintas; (4) crecer = agregar filas/fuentes, no cambiar tablas.

CREATE TABLE source (
  source_id        TEXT PRIMARY KEY,           -- = manifiesto
  name             TEXT NOT NULL,
  version_label    TEXT,                       -- p. ej. fecha del dump
  retrieved_at     TEXT,
  sha256           TEXT,
  license_id       TEXT NOT NULL,
  license_url      TEXT,
  share_alike      INTEGER NOT NULL,
  attribution_text TEXT NOT NULL,
  distribution_status TEXT NOT NULL            -- PENDIENTE_REVISION_LEGAL | PERMITIDO_CON_ATRIBUCION | EXCLUIDA
);

CREATE TABLE lemma (
  lemma_id   INTEGER PRIMARY KEY AUTOINCREMENT,   -- estable, jamás reutilizado
  lemma_key  TEXT NOT NULL UNIQUE,                -- NFC + casefold, con tildes
  display    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','retired')),
  created_in TEXT                                  -- versión del build
);

CREATE TABLE lemma_alias (                         -- para no perder IDs al deduplicar
  old_lemma_id INTEGER PRIMARY KEY,
  canonical_lemma_id INTEGER NOT NULL REFERENCES lemma(lemma_id),
  reason TEXT, changed_in TEXT
);

CREATE TABLE lemma_pos (                           -- una palabra puede tener varias categorías
  lemma_pos_id INTEGER PRIMARY KEY AUTOINCREMENT,
  lemma_id INTEGER NOT NULL REFERENCES lemma(lemma_id),
  pos TEXT NOT NULL,                               -- NOUN VERB ADJ ADV ...
  gender TEXT, number_note TEXT,                   -- cuando la fuente lo documente
  UNIQUE (lemma_id, pos)
);

CREATE TABLE sense (
  sense_id INTEGER PRIMARY KEY AUTOINCREMENT,
  lemma_pos_id INTEGER NOT NULL REFERENCES lemma_pos(lemma_pos_id),
  source_id TEXT NOT NULL REFERENCES source(source_id),
  source_ref TEXT,                                 -- referencia al registro origen
  gloss TEXT, register TEXT, region TEXT,          -- region: 'AR','RIOPLATENSE',... solo si la fuente lo marca
  UNIQUE (source_id, source_ref, lemma_pos_id)
);

CREATE TABLE inflected_form (
  form_id INTEGER PRIMARY KEY AUTOINCREMENT,
  lemma_pos_id INTEGER NOT NULL REFERENCES lemma_pos(lemma_pos_id),
  form_key TEXT NOT NULL, form_display TEXT NOT NULL,
  tags TEXT, source_id TEXT NOT NULL REFERENCES source(source_id)
);
CREATE INDEX ix_inflected_key ON inflected_form(form_key);

CREATE TABLE frequency (
  lemma_id INTEGER NOT NULL REFERENCES lemma(lemma_id),
  source_id TEXT NOT NULL REFERENCES source(source_id),
  count INTEGER, band INTEGER,                     -- band: 1 (muy común) ... 5 (rara)
  PRIMARY KEY (lemma_id, source_id)
);

CREATE TABLE concept (                             -- synsets del MCR u otros
  concept_id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL REFERENCES source(source_id),
  source_ref TEXT NOT NULL, pos TEXT,
  UNIQUE (source_id, source_ref)
);
CREATE TABLE concept_member (
  concept_id INTEGER NOT NULL REFERENCES concept(concept_id),
  lemma_id INTEGER NOT NULL REFERENCES lemma(lemma_id),
  PRIMARY KEY (concept_id, lemma_id)
);

CREATE TABLE relation (                            -- SOLO relaciones respaldadas por una fuente
  relation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  rel_type TEXT NOT NULL CHECK (rel_type IN
    ('synonym','antonym','hypernym','hyponym','part_of','has_part','theme','context')),
  from_kind TEXT NOT NULL CHECK (from_kind IN ('lemma','concept')),
  from_id INTEGER NOT NULL,
  to_kind TEXT NOT NULL CHECK (to_kind IN ('lemma','concept')),
  to_id INTEGER NOT NULL,
  source_id TEXT NOT NULL REFERENCES source(source_id)
);
CREATE INDEX ix_relation_from ON relation(from_kind, from_id, rel_type);

-- App móvil (SQLite aparte, en el dispositivo): solo identificadores usados.
-- CREATE TABLE used_lemma (lemma_id INTEGER PRIMARY KEY, used_at TEXT);
