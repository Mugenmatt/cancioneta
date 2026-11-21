import { GAME_REGISTRY, gameById, gameIds } from '@/games/registry';
import { ONBOARDING_PAGES } from '@/content/onboarding';

describe('catálogo de juegos', () => {
  it('tiene los 32 juegos originales y nuevos en orden', () => {
    const games = GAME_REGISTRY.filter((game) => game.phase !== 'fase0');
    expect(games).toHaveLength(32);
    expect(games.map((game) => game.id)).toEqual(
      Array.from({ length: 32 }, (_, index) => `g${String(index + 1).padStart(2, '0')}`),
    );
    expect(new Set(gameIds()).size).toBe(GAME_REGISTRY.length);
  });

  it('mantiene cinco ejercicios de Fase 0 habilitados', () => {
    const phase0 = GAME_REGISTRY.filter((game) => game.phase === 'fase0');
    expect(phase0.map((game) => game.id)).toEqual(['f0-1', 'f0-2', 'f0-3', 'f0-4', 'f0-5']);
    expect(phase0.every((game) => game.status === 'ready')).toBe(true);
  });

  it('expone los 32 juegos habilitados', () => {
    const numbered = GAME_REGISTRY.filter((game) => game.phase !== 'fase0');
    expect(numbered.every((game) => game.status === 'ready')).toBe(true);
  });
});

describe('contenido de introducción', () => {
  it('tiene tres pantallas completas y sin repeticiones', () => {
    expect(ONBOARDING_PAGES).toHaveLength(3);
    expect(new Set(ONBOARDING_PAGES.map((page) => page.id)).size).toBe(3);
    for (const page of ONBOARDING_PAGES) {
      expect(page.title.length).toBeGreaterThan(10);
      expect(page.body.length).toBeGreaterThan(20);
      expect(page.note.length).toBeGreaterThan(10);
    }
  });

  it('avisa que la canción no se guarda', () => {
    expect(ONBOARDING_PAGES.some((page) => /no se guarda/i.test(page.title))).toBe(true);
  });
});
