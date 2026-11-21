import { useLyricsStore } from '@/stores/lyricsStore';

function reset() {
  useLyricsStore.getState().clear();
  useLyricsStore.setState({ past: [], future: [], exported: false });
}

function firstStanza() {
  const state = useLyricsStore.getState();
  const section = state.sections[0];
  return { section, stanza: section.stanzas[0] };
}

describe('cuaderno en memoria', () => {
  beforeEach(reset);

  it('deshace y rehace una edición', () => {
    const { section, stanza } = firstStanza();
    useLyricsStore.getState().updateStanza(section.id, stanza.id, 'una imagen');
    expect(useLyricsStore.getState().sections[0].stanzas[0].text).toBe('una imagen');
    useLyricsStore.getState().undo();
    expect(useLyricsStore.getState().sections[0].stanzas[0].text).toBe('');
    useLyricsStore.getState().redo();
    expect(useLyricsStore.getState().sections[0].stanzas[0].text).toBe('una imagen');
  });

  it('deshace agregar y quitar secciones', () => {
    const before = useLyricsStore.getState().sections.length;
    useLyricsStore.getState().addSection('bridge', 'Puente');
    expect(useLyricsStore.getState().sections).toHaveLength(before + 1);
    useLyricsStore.getState().undo();
    expect(useLyricsStore.getState().sections).toHaveLength(before);
    useLyricsStore.getState().addSection('outro', 'Final');
    const added = useLyricsStore.getState().sections.at(-1);
    expect(added).toBeDefined();
    if (!added) return;
    useLyricsStore.getState().removeSection(added.id);
    expect(useLyricsStore.getState().sections).toHaveLength(before);
    useLyricsStore.getState().undo();
    expect(useLyricsStore.getState().sections.at(-1)?.name).toBe('Final');
  });

  it('recupera una sección después de vaciar', () => {
    const { section, stanza } = firstStanza();
    useLyricsStore.getState().updateStanza(section.id, stanza.id, 'no borrar');
    const text = useLyricsStore.getState().exportText(false);
    useLyricsStore.getState().clear();
    expect(useLyricsStore.getState().exportText(false)).toBe('');
    useLyricsStore.getState().undo();
    expect(useLyricsStore.getState().exportText(false)).toBe(text);
  });

  it('marca cambios sin exportar', () => {
    const { section, stanza } = firstStanza();
    useLyricsStore.getState().markExported();
    expect(useLyricsStore.getState().exported).toBe(true);
    useLyricsStore.getState().updateStanza(section.id, stanza.id, 'cambio');
    expect(useLyricsStore.getState().exported).toBe(false);
  });

  it('guarda como máximo cien pasos', () => {
    const { section, stanza } = firstStanza();
    let text = '';
    for (let i = 0; i < 105; i += 1) {
      text += 'a';
      useLyricsStore.getState().updateStanza(section.id, stanza.id, text);
    }
    expect(useLyricsStore.getState().past).toHaveLength(100);
  });
});
