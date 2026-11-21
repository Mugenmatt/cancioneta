import { create } from 'zustand';
import type { LyricsSnapshot, SongSection } from '@/core/types';

let sectionCounter = 3;
let stanzaCounter = 4;

export const SECTION_NAMES: { kind: SongSection['kind']; name: string }[] = [
  { kind: 'intro', name: 'Intro' },
  { kind: 'verse', name: 'Verso' },
  { kind: 'chorus', name: 'Estribillo' },
  { kind: 'bridge', name: 'Puente' },
  { kind: 'outro', name: 'Outro' },
  { kind: 'custom', name: 'Sección' },
];

function makeStanza(text = '') {
  stanzaCounter += 1;
  return { id: `st_${stanzaCounter}`, structureId: null, text };
}

function makeSection(name: string, kind: SongSection['kind'], text = ''): SongSection {
  sectionCounter += 1;
  return { id: `sec_${sectionCounter}`, name, kind, stanzas: [makeStanza(text)] };
}

const initialSections: SongSection[] = [
  { id: 'sec_1', name: 'Verso 1', kind: 'verse', stanzas: [makeStanza()] },
  { id: 'sec_2', name: 'Estribillo', kind: 'chorus', stanzas: [makeStanza()] },
];

export interface EditorSnapshot {
  sections: SongSection[];
  activeSectionId: string;
}

export interface LyricsState {
  sections: SongSection[];
  activeSectionId: string;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  exported: boolean;
  setActiveSection: (id: string) => void;
  addSection: (kind: SongSection['kind'], name?: string) => void;
  removeSection: (id: string) => void;
  renameSection: (id: string, name: string) => void;
  addStanza: (sectionId: string) => void;
  removeStanza: (sectionId: string, stanzaId: string) => void;
  updateStanza: (sectionId: string, stanzaId: string, text: string) => void;
  insertStimulus: (text: string) => void;
  replaceAll: (text: string) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  markExported: () => void;
  snapshot: () => LyricsSnapshot;
  words: () => number;
  exportText: (includeStructure: boolean) => string;
}

const HISTORY_LIMIT = 100;

function takeSnapshot(state: LyricsState): EditorSnapshot {
  return { sections: state.sections, activeSectionId: state.activeSectionId };
}

export const useLyricsStore = create<LyricsState>((set, get) => {
  const commit = (updater: (state: LyricsState) => Partial<LyricsState>) => {
    const state = get();
    const past = [...state.past, takeSnapshot(state)].slice(-HISTORY_LIMIT);
    set({ ...updater(state), past, future: [], exported: false });
  };

  return {
  sections: initialSections,
  activeSectionId: 'sec_1',
  past: [],
  future: [],
  exported: false,

  setActiveSection: (activeSectionId) => set({ activeSectionId }),

  addSection: (kind, name) => {
    const template = SECTION_NAMES.find((entry) => entry.kind === kind);
    const section = makeSection(name ?? template?.name ?? 'Sección', kind);
    commit((state) => ({ sections: [...state.sections, section], activeSectionId: section.id }));
  },

  removeSection: (id) => {
    if (get().sections.length <= 1) return;
    commit((state) => {
      const sections = state.sections.filter((section) => section.id !== id);
      return { sections, activeSectionId: state.activeSectionId === id ? sections[0].id : state.activeSectionId };
    });
  },

  renameSection: (id, name) => {
    const current = get().sections.find((section) => section.id === id);
    if (!current || current.name === name) return;
    commit((state) => ({
      sections: state.sections.map((section) => (section.id === id ? { ...section, name } : section)),
    }));
  },

  addStanza: (sectionId) => commit((state) => ({
    sections: state.sections.map((section) => (
      section.id === sectionId ? { ...section, stanzas: [...section.stanzas, makeStanza()] } : section
    )),
  })),

  removeStanza: (sectionId, stanzaId) => {
    const section = get().sections.find((s) => s.id === sectionId);
    if (!section || section.stanzas.length <= 1) return;
    commit((state) => ({
      sections: state.sections.map((entry) => {
        if (entry.id !== sectionId) return entry;
        return { ...entry, stanzas: entry.stanzas.filter((stanza) => stanza.id !== stanzaId) };
      }),
    }));
  },

  updateStanza: (sectionId, stanzaId, text) => {
    const current = get().sections.find((section) => section.id === sectionId)?.stanzas.find((stanza) => stanza.id === stanzaId);
    if (!current || current.text === text) return;
    commit((state) => ({
      sections: state.sections.map((section) => (
        section.id === sectionId
          ? { ...section, stanzas: section.stanzas.map((stanza) => (stanza.id === stanzaId ? { ...stanza, text } : stanza)) }
          : section
      )),
    }));
  },

  insertStimulus: (text) => {
    const { activeSectionId, sections } = get();
    const section = sections.find((s) => s.id === activeSectionId) ?? sections[0];
    if (!section) return;
    const stanza = makeStanza(`${text}\n`);
    set((state) => ({
      sections: state.sections.map((s) => (s.id === section.id ? { ...s, stanzas: [...s.stanzas, stanza] } : s)),
      activeSectionId: section.id,
    }));
  },

  replaceAll: (text) => {
    const section: SongSection = {
      id: `sec_${sectionCounter += 1}`,
      name: 'Borrador',
      kind: 'verse',
      stanzas: [makeStanza(text)],
    };
    commit(() => ({ sections: [section], activeSectionId: section.id }));
  },

  clear: () => {
    const section = makeSection('Verso 1', 'verse');
    commit(() => ({ sections: [section], activeSectionId: section.id }));
  },

  undo: () => {
    const state = get();
    const previous = state.past[state.past.length - 1];
    if (!previous) return;
    set({
      sections: previous.sections,
      activeSectionId: previous.activeSectionId,
      past: state.past.slice(0, -1),
      future: [takeSnapshot(state), ...state.future].slice(0, HISTORY_LIMIT),
      exported: false,
    });
  },

  redo: () => {
    const state = get();
    const next = state.future[0];
    if (!next) return;
    set({
      sections: next.sections,
      activeSectionId: next.activeSectionId,
      past: [...state.past, takeSnapshot(state)].slice(-HISTORY_LIMIT),
      future: state.future.slice(1),
      exported: false,
    });
  },

  markExported: () => set({ exported: true }),

  snapshot: () => {
    const lines: LyricsSnapshot['lines'] = [];
    for (const section of get().sections) {
      section.stanzas.forEach((stanza, stanzaIndex) => {
        stanza.text.split('\n').forEach((line, lineIndex) => {
          const words = line.trim().split(/\s+/).filter(Boolean);
          if (words.length === 0) return;
          lines.push({
            sectionId: section.id,
            sectionName: section.name,
            stanzaId: stanza.id,
            stanzaIndex,
            lineIndex,
            text: line.trim(),
            words,
          });
        });
      });
    }
    return { lines };
  },

  words: () => get().snapshot().lines.reduce((total, line) => total + line.words.length, 0),

  exportText: (includeStructure) => {
    const { sections } = get();
    const chunks = sections.map((section) => {
      const body = section.stanzas.map((stanza) => stanza.text.trim()).filter(Boolean).join('\n\n');
      if (!body) return '';
      return includeStructure ? `${section.name.toUpperCase()}\n\n${body}` : body;
    }).filter(Boolean);
    return chunks.join('\n\n\n');
  },
  };
});
