-- STAGING OpenSLR SLR21 (frecuencias de formas). Sin categoría gramatical ni lemas.
CREATE TABLE IF NOT EXISTS stage_meta (key TEXT PRIMARY KEY, value TEXT);

CREATE TABLE IF NOT EXISTS form_freq (      -- una fila por registro crudo
  word_raw     TEXT NOT NULL,
  word_key     TEXT NOT NULL,
  count        INTEGER NOT NULL,
  valid_word   INTEGER NOT NULL,
  is_multiword INTEGER NOT NULL,
  has_digit    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS freq_by_key (    -- agregado por clave normalizada
  word_key    TEXT PRIMARY KEY,
  count_sum   INTEGER NOT NULL,
  n_variants  INTEGER NOT NULL,
  valid_word  INTEGER NOT NULL,
  rank        INTEGER NOT NULL
);
