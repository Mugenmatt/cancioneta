import { GAME_FLOW_TEXT, PHASE_LABEL } from '@/content/gameFlow';
import { HOME_TEXT } from '@/content/home';
import { MATERIAL_TEXT } from '@/content/material';
import { SETTINGS_TEXT } from '@/content/ajustes';
import { ONBOARDING_PAGES, ONBOARDING_UI_TEXT } from '@/content/onboarding';
import { RIMAS_TEXT } from '@/content/rimas';
import type { PoolItem } from '@/core/types';

describe('textos de la dirección El cuaderno de medianoche', () => {
  it('cubre los filtros, licencias y etiquetas del material', () => {
    expect(Object.keys(MATERIAL_TEXT.filters)).toEqual(['all', 'words', 'culture', 'prompts', 'dice', 'images']);
    expect(MATERIAL_TEXT.results(1)).toBe('1 resultado');
    expect(MATERIAL_TEXT.results(2)).toBe('2 resultados');

    const licenses: PoolItem['license'][] = [
      'original', 'public_domain', 'cc0', 'cc_by', 'cc_by_sa', 'metadata_only', 'permission',
    ];
    expect(Object.keys(MATERIAL_TEXT.license).sort()).toEqual([...licenses].sort());
    expect(MATERIAL_TEXT.poolLabels.images).toBe('Imagen');
  });

  it('compone los textos de ajustes en es-AR', () => {
    expect(SETTINGS_TEXT.dataSummary(12, 3)).toBe('12 piezas cargadas en 3 pools.');
    expect(Object.values(SETTINGS_TEXT.themes)).toEqual(['Sistema', 'Claro', 'Oscuro']);
    expect(SETTINGS_TEXT.footer).toBe('Cancioneta 0.1.0 · offline first');
  });

  it('mantiene la voz del onboarding y su progreso', () => {
    expect(ONBOARDING_UI_TEXT.wordmark).toBe('Cancioneta');
    expect(ONBOARDING_UI_TEXT.reviewDone).toBe('Volver');
    expect(ONBOARDING_UI_TEXT.progress(2, ONBOARDING_PAGES.length)).toBe('Pantalla 2 de 3');
  });

  it('ofrece un estado vacío para rimas', () => {
    expect(RIMAS_TEXT.idleTitle).toBe('Todavía no buscaste rimas');
    expect(RIMAS_TEXT.idle).toBe('Acá van a aparecer las rimas.');
  });
});

describe('textos de inicio y listado de juegos', () => {
  it('mueve el inicio a contenido en voseo es-AR', () => {
    expect(HOME_TEXT.tagline).toBe('Cuaderno de canciones');
    expect(HOME_TEXT.heroBody).toBe('Jugá, escribí, escuchá. Sin cuenta, sin nube, sin deberes.');
    expect(HOME_TEXT.quick.warmup).toEqual({ title: 'Calentar', body: 'Fase 0' });
    expect(HOME_TEXT.privacyTitle).toBe('Tu letra no se guarda al salir');
  });

  it('compone el resumen y la búsqueda del listado', () => {
    expect(GAME_FLOW_TEXT.gamesSubtitle).toBe('Formas de empezar');
    expect(GAME_FLOW_TEXT.overview(31, 5)).toBe('31 juegos, 5 ejercicios de calentamiento.');
    expect(GAME_FLOW_TEXT.searchLabel).toBe('Buscar juegos');
    expect(GAME_FLOW_TEXT.searchPlaceholder).toContain('consigna');
    expect(GAME_FLOW_TEXT.clearSearch).toBe('Limpiar búsqueda');
    expect(GAME_FLOW_TEXT.fase0Number).toBe('F0');
    expect(GAME_FLOW_TEXT.number(7)).toBe('07');
    expect(PHASE_LABEL).toEqual({
      fase0: 'Fase 0 · Calentar',
      original: 'Los originales',
      nuevo: 'Nuevos juegos',
    });
  });
});
