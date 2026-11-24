import { GALLERY_MODES, auditGalleryContrast, galleryEntries } from '@/design/galleryAudit';
import { gameThemes } from '@/design/themes';
import { GAME_REGISTRY, gameIds } from '@/games/registry';

describe('galería visual', () => {
  it('muestra 37 tarjetas: 36 temas reales y G-31 pendiente', () => {
    const entries = galleryEntries();
    expect(entries).toHaveLength(37);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(37);
    expect(entries.filter((entry) => entry.status === 'ready')).toHaveLength(36);
    expect(entries.filter((entry) => entry.status === 'pending').map((entry) => entry.id)).toEqual(['g31']);
    expect(entries.map((entry) => entry.id)).toEqual(expect.arrayContaining(gameIds()));
    expect(entries.find((entry) => entry.id === 'g31')?.theme).toBeUndefined();
  });

  it('usa el tema correcto de cada juego habilitado', () => {
    for (const entry of galleryEntries().filter((item) => item.status === 'ready')) {
      expect(entry.theme).toBeDefined();
      expect(entry.theme?.id).toBe(entry.id);
      expect(gameThemes[entry.id]).toBeDefined();
    }
  });

  it('ordena G-31 antes de G-32 dentro de los nuevos juegos', () => {
    const ids = galleryEntries().map((entry) => entry.id);
    expect(ids.indexOf('g31')).toBeGreaterThan(ids.indexOf('g30'));
    expect(ids.indexOf('g31')).toBeLessThan(ids.indexOf('g32'));
  });

  it('cubre claro y oscuro con contraste AA en los 36 temas', () => {
    expect(GALLERY_MODES).toEqual(['light', 'dark']);
    const audit = auditGalleryContrast();
    expect(audit.checked).toBe(GAME_REGISTRY.length * GALLERY_MODES.length * 3 * 3);
    expect(audit.findings).toEqual([]);
  });
});
