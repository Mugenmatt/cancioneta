export const TITLE_TEXT = {
  intro: 'Una tarjeta trae un título ajeno y su autor. Dejá que la portada te abra una escena y escribí sin copiar la obra.',
  coverFallback: 'Título',
  coverEyebrow: 'PORTADA',
  coverBody: (title: string, author?: string) => author ? `${title}\n${author}` : title,
  coverKind: (kind?: string, year?: number) => kind ? `${kind}${year ? ` · ${year}` : ''}` : TITLE_TEXT.coverFallback,
  anotherCard: 'Otra tarjeta',
  note: 'Tomá solo el impulso: una imagen, un tono, una pregunta. «Llevar al cuaderno» agrega el título como estímulo nuevo y no toca tu letra.',
  searchError: 'No hay títulos disponibles en este paquete.',
} as const;

export const SKIN_TEXT = {
  intro: 'Un personaje te presta su voz. Investigalo si querés, pero no copies la obra: escribí una escena nueva desde su cuerpo.',
  fileLabel: 'Expediente',
  searching: 'Buscando un personaje…',
  fileEyebrow: (kind?: string) => kind ? `Expediente · ${kind}` : 'Expediente',
  whoIs: 'Quién es',
  investigate: 'Investigar en el navegador',
  investigateLabel: (name: string) => `Investigar ${name}`,
  anotherCharacter: 'Otro personaje',
  copyFile: 'Copiar ficha',
  note: 'El enlace abre el navegador del teléfono y necesita conexión. La ficha y el ejercicio funcionan offline.',
  fileBody: (name: string, work?: string, description?: string) => [name, work, description].filter(Boolean).join('\n'),
  editorPrompt: (name: string, work?: string, description?: string) => [
    `Escribí en primera persona como ${name}${work ? `, de ${work}` : ''}.`,
    description,
    '¿Qué ve, qué teme, qué desea?',
  ].filter(Boolean).join('\n'),
  linkErrorTitle: 'No se pudo abrir el enlace',
  linkErrorBody: 'Revisá la conexión o buscá la obra por tu cuenta.',
  searchError: 'No hay personajes disponibles en este paquete.',
} as const;
