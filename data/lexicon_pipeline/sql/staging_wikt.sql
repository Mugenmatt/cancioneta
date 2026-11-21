-- STAGING Wiktextract (es). Una base por fuente; NO se mezcla con otras.
CREATE TABLE IF NOT EXISTS stage_meta (key TEXT PRIMARY KEY, value TEXT);

CREATE TABLE IF NOT EXISTS entry (
  entry_id        INTEGER PRIMARY KEY,
  line_no         INTEGER NOT NULL,          -- línea del archivo origen (trazabilidad)
  word            TEXT NOT NULL,             -- forma tal cual (NFC)
  word_key        TEXT NOT NULL,             -- NFC + casefold, conserva tildes
  accentless_key  TEXT NOT NULL,             -- solo diagnóstico
  lang_code       TEXT NOT NULL,
  pos_raw         TEXT,
  pos_norm        TEXT NOT NULL,             -- NOUN VERB ADJ ADV PRON ADP CONJ INTJ DET NUM PHRASE AFFIX SYM CONTR PROPN OTHER UNKNOWN
  kind            TEXT NOT NULL CHECK (kind IN ('lemma','inflected_form','variant')),
  n_senses        INTEGER NOT NULL,
  is_multiword    INTEGER NOT NULL,
  valid_word      INTEGER NOT NULL,          -- pasa la regex de letras españolas
  region_ar_tag   INTEGER NOT NULL,          -- etiqueta explícita argentina/rioplatense/lunfardo
  region_ar_gloss INTEGER NOT NULL,          -- HEURÍSTICA: la definición menciona Argentina/Río de la Plata
  registers       TEXT                       -- coloquial,vulgar,poético,...
);
CREATE INDEX IF NOT EXISTS ix_entry_key  ON entry(word_key);
CREATE INDEX IF NOT EXISTS ix_entry_kind ON entry(kind, pos_norm);

CREATE TABLE IF NOT EXISTS sense (
  entry_id  INTEGER NOT NULL REFERENCES entry(entry_id),
  sense_idx INTEGER NOT NULL,
  gloss     TEXT,
  tags_json TEXT,
  form_of   TEXT,
  alt_of    TEXT,
  PRIMARY KEY (entry_id, sense_idx)
);

CREATE TABLE IF NOT EXISTS form (
  entry_id  INTEGER NOT NULL REFERENCES entry(entry_id),
  form      TEXT NOT NULL,
  form_key  TEXT NOT NULL,
  tags_json TEXT
);
CREATE INDEX IF NOT EXISTS ix_form_key ON form(form_key);

CREATE TABLE IF NOT EXISTS relation (
  entry_id   INTEGER NOT NULL REFERENCES entry(entry_id),
  sense_idx  INTEGER,
  rel_type   TEXT NOT NULL,   -- synonym antonym hypernym hyponym holonym meronym related derived coordinate troponym
  target     TEXT NOT NULL,
  target_key TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_rel_type ON relation(rel_type);
