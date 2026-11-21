"""Cliente HTTP cortes: User-Agent con contacto, limite por host, reintentos y cache en disco."""
from __future__ import annotations

import hashlib
import json
import logging
import time
from pathlib import Path
from urllib.parse import urlencode, urlsplit

import requests

log = logging.getLogger("cdb.http")


class HttpError(Exception):
    def __init__(self, message, status=0):
        super().__init__(message)
        self.status = status


class HttpClient:
    def __init__(self, user_agent: str, cache_dir: Path, intervalos: dict | None = None, ttl_dias: float = 30,
                 timeout: int = 60, reintentos: int = 5, session=None, sleep=time.sleep, clock=time.monotonic):
        self.ua = user_agent
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.intervalos = intervalos or {}
        self.ttl = ttl_dias * 86400
        self.timeout = timeout
        self.reintentos = reintentos
        self.session = session or requests.Session()
        self.sleep = sleep
        self.clock = clock
        self._last: dict[str, float] = {}
        self.pedidos = 0
        self.aciertos_cache = 0

    # -- utilidades -------------------------------------------------------
    def _throttle(self, host: str):
        gap = float(self.intervalos.get(host, self.intervalos.get("default", 1.0)))
        last = self._last.get(host)
        if last is not None:
            espera = gap - (self.clock() - last)
            if espera > 0:
                self.sleep(espera)
        self._last[host] = self.clock()

    def _cache_path(self, url, params, headers) -> Path:
        raw = url + "?" + urlencode(sorted((params or {}).items())) + json.dumps(headers or {}, sort_keys=True)
        return self.cache_dir / (hashlib.sha1(raw.encode("utf-8")).hexdigest() + ".json")

    def _headers(self, extra=None):
        h = {"User-Agent": self.ua, "Accept-Encoding": "gzip"}
        h.update(extra or {})
        return h

    # -- API --------------------------------------------------------------
    def get_json(self, url: str, params: dict | None = None, headers: dict | None = None, usar_cache: bool = True):
        cpath = self._cache_path(url, params, headers)
        if usar_cache and cpath.exists() and (time.time() - cpath.stat().st_mtime) < self.ttl:
            self.aciertos_cache += 1
            with open(cpath, encoding="utf-8") as fh:
                return json.load(fh)
        host = urlsplit(url).netloc
        ultimo = None
        for intento in range(self.reintentos):
            self._throttle(host)
            try:
                self.pedidos += 1
                resp = self.session.get(url, params=params, headers=self._headers(headers), timeout=self.timeout)
            except requests.RequestException as exc:  # red caida, timeout, etc.
                ultimo = HttpError(f"{type(exc).__name__}: {exc}")
                self.sleep(min(60, 2 ** (intento + 1)))
                continue
            if resp.status_code in (429, 500, 502, 503, 504):
                espera = resp.headers.get("Retry-After", "")
                espera = float(espera) if str(espera).replace(".", "", 1).isdigit() else 2 ** (intento + 2)
                ultimo = HttpError(f"HTTP {resp.status_code} en {url}", resp.status_code)
                log.warning("HTTP %s en %s; reintento en %.0fs", resp.status_code, host, espera)
                self.sleep(min(120, espera))
                continue
            if resp.status_code >= 400:
                raise HttpError(f"HTTP {resp.status_code} en {url}", resp.status_code)
            try:
                data = resp.json()
            except ValueError as exc:
                raise HttpError(f"Respuesta no JSON en {url}: {exc}", resp.status_code)
            tmp = cpath.with_suffix(".tmp")
            with open(tmp, "w", encoding="utf-8") as fh:
                json.dump(data, fh, ensure_ascii=False)
            tmp.replace(cpath)
            return data
        raise ultimo or HttpError(f"Sin respuesta de {url}")

    def status(self, url: str) -> int:
        """Codigo HTTP de una URL (HEAD con respaldo a GET). 0 si hubo error de red."""
        host = urlsplit(url).netloc
        self._throttle(host)
        try:
            r = self.session.head(url, headers=self._headers(), timeout=self.timeout, allow_redirects=True)
            if r.status_code in (403, 405, 501):
                self._throttle(host)
                r = self.session.get(url, headers=self._headers(), timeout=self.timeout, allow_redirects=True,
                                     stream=True)
                r.close()
            return r.status_code
        except requests.RequestException:
            return 0
