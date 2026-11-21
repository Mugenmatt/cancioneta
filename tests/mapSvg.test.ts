import type { useGameTheme } from '@/design/ThemeProvider';
import { mapToSvg } from '@/games/runtime/mapSvg';
import type { MapLayout } from '@/games/runtime/mapLogic';

describe('mapToSvg', () => {
  const theme = { ink: '#111111', surface: '#ffffff', accentText: '#222222' } as unknown as ReturnType<typeof useGameTheme>;
  const layout: MapLayout = {
    positions: { a: { x: 0, y: 0 }, b: { x: 200, y: 0 } },
    connections: [{ from: 'a', to: 'b', relation: 'manual' }],
    entries: [
      { id: 'a', text: 'A & B <C>', relation: 'manual', depth: 1, x: 0, y: 0 },
      { id: 'b', text: 'Hijo', relation: 'synonym', depth: 2, x: 200, y: 0 },
    ],
    width: 400,
    height: 200,
  };

  it('genera un SVG con conexiones, nodos y texto escapado', () => {
    const svg = mapToSvg(layout, theme);

    expect(svg).toContain('<svg');
    expect(svg).toContain('width="400" height="200"');
    expect(svg).toContain('<line');
    expect(svg).toContain('A &amp; B &lt;C&gt;');
    expect(svg).toContain('A mano');
    expect(svg).toContain('Sinónimo');
  });
});
