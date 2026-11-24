import { dataService } from '@/services/data/DataService';
import { G38_TEXT, G38_TIMER_MINUTES } from '@/content/games/g38';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import {
  makeSceneStimulus, sceneDeadlineAt, sceneFromItem, type StolenScene,
} from '@/games/runtime/g38Logic';

const scene: StolenScene = {
  description: 'Alguien deja una taza sin probar.',
  character: 'Quien la sirvió',
  unsaid: 'Ya sabe que no va a volver.',
};

describe('G-38 Escena robada', () => {
  it('tiene 30 escenas originales con sus tres campos', () => {
    const items = dataService.getPool('stolen_scenes');
    expect(items).toHaveLength(30);
    expect(items.every((item) => item.license === 'original')).toBe(true);
    expect(new Set(items.map((item) => item.fingerprint)).size).toBe(30);
    expect(items.every((item) => {
      const parsed = sceneFromItem(item);
      return Boolean(parsed.description && parsed.character && parsed.unsaid);
    })).toBe(true);
  });

  it('no nombra obras ni personajes de obras en el banco', () => {
    const text = dataService.getPool('stolen_scenes')
      .flatMap((item) => [item.text, String(item.extra?.character ?? ''), String(item.extra?.unsaid ?? '')])
      .join(' ');
    expect(text).not.toMatch(/película|novela|capítulo|diálogo|«/);
  });

  it('usa un temporizador opcional de 30 minutos', () => {
    expect(G38_TIMER_MINUTES).toBe(30);
    expect(sceneDeadlineAt(30, 1_000)).toBe(1_800_000 + 1_000);
  });

  it('muestra la escena, el personaje y lo no dicho en el editor', () => {
    const stimulus = makeSceneStimulus({
      scene,
      title: G38_TEXT.editorTitle(scene.character),
      groupTitles: {
        scene: G38_TEXT.editorGroup,
        character: G38_TEXT.characterGroup,
        unsaid: G38_TEXT.unsaidGroup,
      },
      note: G38_TEXT.editorNote,
      timeLabel: G38_TEXT.timeLabel,
    });
    expect(stimulus.gameId).toBe('g38');
    expect(stimulus.groups?.map((group) => group.items[0])).toEqual([
      scene.description, scene.character, scene.unsaid,
    ]);
    expect(stimulus.deadlineLabel).toBe('Tiempo restante');
    expect(G38_TEXT.consigna(scene.description, scene.character, scene.unsaid)).toContain('sin contar lo demás');
  });

  it('tiene tema propio y ficha en el registro', () => {
    const game = gameById('g38');
    expect(game?.name).toBe('Escena robada');
    expect(game?.themeId).toBe('g38');
    expect(gameThemes.g38.id).toBe('g38');
  });
});
