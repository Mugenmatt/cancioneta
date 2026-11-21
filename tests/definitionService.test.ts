import { getWordDefinition } from '@/services/definitions/DefinitionService';

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();

function wiktionaryPayload(content: string): unknown {
  return {
    query: {
      pages: [
        {
          revisions: [
            {
              slots: {
                main: { content },
              },
            },
          ],
        },
      ],
    },
  };
}

describe('DefinitionService', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('obtiene la definición en español desde la API de Wiktionary', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => wiktionaryPayload([
        '{{desambiguación|Casa}}',
        '== {{lengua|es}} ==',
        '=== Etimología 1 ===',
        '==== {{sustantivo femenino|es}} ====',
        ';1 {{csem|vivienda}}: {{plm|edificación}} destinada a [[vivienda]].',
        '== {{lengua|en}} ==',
        ';1: house.',
      ].join('\n')),
    });

    const result = await getWordDefinition('casa');

    expect(result.source).toBe('wiktionary');
    expect(result.definition).toContain('edificación destinada a vivienda');
    expect(result.definition).not.toContain('house');
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('es.wiktionary.org/w/api.php');
    expect(url).toContain('action=query');
  });

  it('no usa definiciones de otras secciones de idioma', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => wiktionaryPayload([
        '== {{lengua|en}} ==',
        ';1: house.',
      ].join('\n')),
    });

    const result = await getWordDefinition('sin-seccion-es');

    expect(result.source).toBe('none');
    expect(result.definition).toBe('');
  });
});
