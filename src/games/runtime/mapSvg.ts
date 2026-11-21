import { MAP_TEXT } from '@/content/games/g23';
import { alpha, fontSizes, fonts, spacing } from '@/design/tokens';
import type { useGameTheme } from '@/design/ThemeProvider';
import { MAP_LAYOUT, type MapLayout } from './mapLogic';

type Theme = ReturnType<typeof useGameTheme>;

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[char] ?? char);
}

export function mapToSvg(layout: MapLayout, theme: Theme): string {
  const connections = layout.connections.map((connection) => {
    const from = layout.positions[connection.from];
    const to = layout.positions[connection.to];
    if (!from || !to) return '';
    return `<line x1="${from.x + MAP_LAYOUT.nodeWidth}" y1="${from.y + MAP_LAYOUT.nodeHeight / 2}" x2="${to.x}" y2="${to.y + MAP_LAYOUT.nodeHeight / 2}" stroke="${alpha(theme.ink, 0.42)}" stroke-width="${spacing.xxs / 2}"/>`;
  }).join('');

  const nodes = layout.entries.map((entry) => {
    const relation = MAP_TEXT.relationLabels[entry.relation];
    const text = entry.text || MAP_TEXT.emptyNode;
    return `<g><rect x="${entry.x}" y="${entry.y}" width="${MAP_LAYOUT.nodeWidth}" height="${MAP_LAYOUT.nodeHeight}" rx="${spacing.xs}" fill="${alpha(theme.surface, 0.92)}" stroke="${alpha(theme.ink, 0.22)}"/><text x="${entry.x + spacing.xs}" y="${entry.y + spacing.md}" fill="${theme.accentText}" font-family="${fonts.sansSemiBold}" font-size="${fontSizes.caption}">${escapeXml(relation)}</text><text x="${entry.x + spacing.xs}" y="${entry.y + MAP_LAYOUT.nodeHeight - spacing.xs}" fill="${theme.ink}" font-family="${fonts.serif}" font-size="${fontSizes.small}">${escapeXml(text)}</text></g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}"><rect width="100%" height="100%" fill="${alpha(theme.surface, 0.4)}"/>${connections}${nodes}</svg>`;
}
