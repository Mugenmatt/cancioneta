import { GAME_REGISTRY, gameById, gameCounts, gameIds } from '@/games/registry';
import { ONBOARDING_PAGES } from '@/content/onboarding';

describe('catálogo de juegos', () => {
  it('tiene los juegos numerados habilitados y sin g31', () => {
    const games = GAME_REGISTRY.filter((game) => game.phase !== 'fase0');
    expect(games.map((game) => game.id)).toEqual([
      'g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10',
      'g11', 'g12', 'g13', 'g14', 'g15', 'g16', 'g17', 'g18', 'g19', 'g20',
      'g21', 'g22', 'g23', 'g24', 'g25', 'g26', 'g27', 'g28', 'g29', 'g30', 'g32',
      'g33', 'g34', 'g35', 'g36', 'g37', 'g38', 'g39', 'g41', 'g42', 'g43', 'g44', 'g45', 'g48', 'g49', 'g50', 'g52', 'g53', 'g54', 'g55', 'g56', 'g57',
    ]);
    expect(games).not.toContainEqual(expect.objectContaining({ id: 'g31' }));
    expect(new Set(gameIds()).size).toBe(GAME_REGISTRY.length);
  });

  it('mantiene cinco ejercicios de Fase 0 habilitados', () => {
    const phase0 = GAME_REGISTRY.filter((game) => game.phase === 'fase0');
    expect(phase0.map((game) => game.id)).toEqual(['f0-1', 'f0-2', 'f0-3', 'f0-4', 'f0-5']);
    expect(phase0.every((game) => game.status === 'ready')).toBe(true);
  });

  it('expone los juegos numerados habilitados', () => {
    const numbered = GAME_REGISTRY.filter((game) => game.phase !== 'fase0');
    expect(numbered.every((game) => game.status === 'ready')).toBe(true);
  });

  it('deriva los contadores del registro', () => {
    expect(gameCounts()).toEqual({ games: 52, fase0: 5, total: 57 });
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
