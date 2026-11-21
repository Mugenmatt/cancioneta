import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PoolId, PoolItem, PoolStats, RandomSource } from '@/core/types';
import { DataService, dataService } from '@/services/data/DataService';

export interface LedgerStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export class MemoryLedgerStorage implements LedgerStorage {
  private map = new Map<string, string>();
  async getItem(key: string): Promise<string | null> {
    return this.map.get(key) ?? null;
  }
  async setItem(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }
}

interface PoolLedger {
  cycle: number;
  used: string[];
  last: string | null;
}

export interface LedgerState {
  version: 1;
  pools: Record<string, PoolLedger>;
  shared: string[];
}

export interface DrawOptions {
  filter?: (item: PoolItem) => boolean;
  excludeFingerprints?: Set<string>;
}

export interface RandomServiceOptions {
  data?: DataService;
  storage?: LedgerStorage;
  rng?: () => number;
  sharedPools?: PoolId[];
  storageKey?: string;
}

const DEFAULT_SHARED: PoolId[] = [
  'titles', 'characters', 'songs', 'poems_songs_ref', 'quote_public', 'script_phrases',
];

const STORAGE_KEY = 'cancioneta.ledger.v1';

export function emptyLedger(): LedgerState {
  return { version: 1, pools: {}, shared: [] };
}

function isLedgerState(value: unknown): value is LedgerState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LedgerState>;
  return candidate.version === 1 && typeof candidate.pools === 'object' && Array.isArray(candidate.shared);
}

export class RandomService implements RandomSource {
  private data: DataService;
  private storage: LedgerStorage;
  private rng: () => number;
  private sharedPools: Set<string>;
  private storageKey: string;
  private ledger: LedgerState = emptyLedger();
  private loaded = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingSave = false;

  constructor(options: RandomServiceOptions = {}) {
    this.data = options.data ?? dataService;
    this.storage = options.storage ?? AsyncStorage;
    this.rng = options.rng ?? Math.random;
    this.sharedPools = new Set(options.sharedPools ?? DEFAULT_SHARED);
    this.storageKey = options.storageKey ?? STORAGE_KEY;
  }

  async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const raw = await this.storage.getItem(this.storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isLedgerState(parsed)) this.ledger = parsed;
      }
    } catch {
      this.ledger = emptyLedger();
    }
  }

  next(): number {
    return this.rng();
  }

  int(maxExclusive: number): number {
    if (maxExclusive <= 0) return 0;
    return Math.floor(this.rng() * maxExclusive);
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  pickOne<T>(items: readonly T[]): T | null {
    if (items.length === 0) return null;
    return items[this.int(items.length)];
  }

  private poolLedger(pool: string): PoolLedger {
    if (!this.ledger.pools[pool]) this.ledger.pools[pool] = { cycle: 0, used: [], last: null };
    return this.ledger.pools[pool];
  }

  private isShared(pool: PoolId): boolean {
    return this.sharedPools.has(pool);
  }

  private sharedHit(fingerprint: string): boolean {
    return this.ledger.shared.includes(fingerprint);
  }

  private async persistSoon(): Promise<void> {
    this.pendingSave = true;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      void this.flush();
    }, 500);
  }

  async flush(): Promise<void> {
    if (!this.pendingSave) return;
    this.pendingSave = false;
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    try {
      await this.storage.setItem(this.storageKey, JSON.stringify(this.ledger));
    } catch {
      // El ledger es técnico: si falla el guardado no se bloquea la app.
    }
  }

  async draw(pool: PoolId, n: number, opts: DrawOptions = {}): Promise<PoolItem[]> {
    await this.ensureLoaded();
    const items = this.data.getPool(pool);
    if (items.length === 0 || n <= 0) return [];
    const ledger = this.poolLedger(pool);
    const used = new Set(ledger.used);
    const exclude = opts.excludeFingerprints ?? new Set<string>();
    const accept = (item: PoolItem) =>
      !used.has(item.fingerprint) && !exclude.has(item.fingerprint) &&
      (!this.isShared(pool) || !this.sharedHit(item.fingerprint)) &&
      (!opts.filter || opts.filter(item));

    let candidates = this.shuffle(items.filter(accept));
    const picked: PoolItem[] = candidates.slice(0, Math.min(n, candidates.length));
    let remaining = n - picked.length;

    if (remaining > 0) {
      const leftoversFp = new Set(picked.map((item) => item.fingerprint));
      const lastOfPrevious = ledger.last;
      ledger.cycle += 1;
      ledger.used = [...leftoversFp];
      const lastFp = lastOfPrevious;
      let fresh = this.shuffle(items.filter((item) =>
        !leftoversFp.has(item.fingerprint) &&
        !exclude.has(item.fingerprint) &&
        (!this.isShared(pool) || !this.sharedHit(item.fingerprint)) &&
        (!opts.filter || opts.filter(item)),
      ));
      if (fresh.length > 1 && lastFp) fresh = fresh.filter((item) => item.fingerprint !== lastFp);
      if (fresh.length === 0) {
        fresh = this.shuffle(items.filter((item) => !leftoversFp.has(item.fingerprint)));
      }
      const extra = fresh.slice(0, remaining);
      picked.push(...extra);
      remaining = n - picked.length;
      if (remaining > 0) {
        const fallback = items.filter((item) => !picked.some((p) => p.fingerprint === item.fingerprint));
        picked.push(...this.shuffle(fallback).slice(0, remaining));
      }
    }

    if (picked.length === 0) return [];

    ledger.used = Array.from(new Set([...ledger.used, ...picked.map((item) => item.fingerprint)]));
    ledger.last = picked[picked.length - 1]?.fingerprint ?? ledger.last;
    if (this.isShared(pool)) {
      this.ledger.shared = Array.from(new Set([...this.ledger.shared, ...picked.map((item) => item.fingerprint)]));
    }
    if (ledger.cycle === 0) ledger.cycle = 0;
    await this.persistSoon();
    return picked;
  }

  markShown(items: PoolItem[]): void {
    if (items.length === 0) return;
    for (const item of items) {
      const ledger = this.poolLedger(item.pool);
      if (!ledger.used.includes(item.fingerprint)) ledger.used.push(item.fingerprint);
      ledger.last = item.fingerprint;
      if (this.isShared(item.pool) && !this.ledger.shared.includes(item.fingerprint)) {
        this.ledger.shared.push(item.fingerprint);
      }
    }
    void this.persistSoon();
  }

  async pickGame(gameIds: string[]): Promise<string | null> {
    await this.ensureLoaded();
    if (gameIds.length === 0) return null;
    const pool = this.poolLedger('games');
    const used = new Set(pool.used);
    let candidates = this.shuffle(gameIds.filter((id) => !used.has(id)));
    if (candidates.length === 0) {
      pool.cycle += 1;
      pool.used = [];
      candidates = this.shuffle(gameIds.filter((id) => id !== pool.last));
      if (candidates.length === 0) candidates = this.shuffle(gameIds);
    }
    const chosen = candidates[0];
    const item = this.data.getPool('games').find((entry) => entry.text === chosen);
    if (item) {
      pool.used.push(item.fingerprint);
      pool.last = item.fingerprint;
    } else {
      pool.used.push(`game:${chosen}`);
      pool.last = `game:${chosen}`;
    }
    await this.persistSoon();
    return chosen;
  }

  async isProgressionUsed(fingerprint: string): Promise<boolean> {
    await this.ensureLoaded();
    return Boolean(this.ledger.pools.progressions?.used.includes(fingerprint));
  }

  async markProgression(fingerprint: string): Promise<void> {
    await this.ensureLoaded();
    const ledger = this.poolLedger('progressions');
    if (!ledger.used.includes(fingerprint)) ledger.used.push(fingerprint);
    ledger.last = fingerprint;
    await this.persistSoon();
  }

  async stats(pool: PoolId): Promise<PoolStats> {
    await this.ensureLoaded();
    const items = this.data.getPool(pool);
    const ledger = this.ledger.pools[pool] ?? { cycle: 0, used: [], last: null };
    const valid = new Set(items.map((item) => item.fingerprint));
    return { total: items.length, used: ledger.used.filter((fp) => valid.has(fp)).length, cycle: ledger.cycle };
  }

  async reset(pool?: PoolId): Promise<void> {
    await this.ensureLoaded();
    if (pool) {
      delete this.ledger.pools[pool];
      if (this.isShared(pool)) {
        const remaining = new Set<string>();
        for (const [key, value] of Object.entries(this.ledger.pools)) {
          if (this.sharedPools.has(key)) value.used.forEach((fp) => remaining.add(fp));
        }
        this.ledger.shared = Array.from(remaining);
      }
    } else {
      this.ledger = emptyLedger();
    }
    this.pendingSave = true;
    await this.flush();
  }

  getSnapshot(): LedgerState {
    return JSON.parse(JSON.stringify(this.ledger)) as LedgerState;
  }
}

export const randomService = new RandomService();
