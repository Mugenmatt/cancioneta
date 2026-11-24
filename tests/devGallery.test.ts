import { GALLERY_MODES, auditGalleryContrast, galleryEntries } from '@/design/galleryAudit';
import { gameThemes } from '@/design/themes';
import { GAME_REGISTRY, gameIds } from '@/games/registry';

describe('galería visual', () => {
  it('muestra una tarjeta por juego habilitado', () => {
    const entries = galleryEntries();
    expect(entries).toHaveLength(GAME_REGISTRY.length);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(GAME_REGISTRY.length);
    expect(entries.map((entry) => entry.id)).toEqual(expect.arrayContaining(gameIds()));
    expect(entries.every((entry) => entry.status === 'ready')).toBe(true);
    expect(entries.every((entry) => entry.theme !== undefined)).toBe(true);
  });

  it('oculta los juegos que no están listos para jugarse', () => {
    const ids = galleryEntries().map((entry) => entry.id);
    expect(ids).not.toContain('g31');
    expect(ids).not.toContain('g40');
  });

  it('usa el tema correcto de cada juego habilitado', () => {
    for (const entry of galleryEntries().filter((item) => item.status === 'ready')) {
      expect(entry.theme).toBeDefined();
      expect(entry.theme?.id).toBe(entry.id);
      expect(gameThemes[entry.id]).toBeDefined();
    }
  });

  it('cubre claro y oscuro con contraste AA en los 60 temas', () => {
    expect(GALLERY_MODES).toEqual(['light', 'dark']);
    const audit = auditGalleryContrast();
    expect(audit.checked).toBe(GAME_REGISTRY.length * GALLERY_MODES.length * 3 * 3);
    expect(audit.findings).toEqual([]);
  });
});
