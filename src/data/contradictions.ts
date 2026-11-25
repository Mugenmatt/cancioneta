export interface ContradictionSeed {
  label: string;
  instruction: string;
}

export const contradictionModes: readonly ContradictionSeed[] = [
  {
    label: 'Ironía',
    instruction: 'Escribí un estribillo que diga lo contrario de la estrofa fingiendo que está de acuerdo.',
  },
  {
    label: 'Negación',
    instruction: 'Escribí un estribillo que niegue, uno por uno, los hechos de la estrofa.',
  },
  {
    label: 'Cambio de punto de vista',
    instruction: 'Escribí un estribillo contado por otro personaje que vio la misma escena de otra manera.',
  },
  {
    label: 'Mentira piadosa',
    instruction: 'Escribí un estribillo que mienta a propósito para cuidar a alguien de lo que dice la estrofa.',
  },
  {
    label: 'Exageración',
    instruction: 'Escribí un estribillo que lleve al extremo lo que dice la estrofa hasta volverlo ridículo.',
  },
  {
    label: 'Inversión de roles',
    instruction: 'Escribí un estribillo donde quien hablaba en la estrofa ahora escucha y quien escuchaba responde.',
  },
  {
    label: 'Contradicción temporal',
    instruction: 'Escribí un estribillo que ubique la misma escena en otro momento y niegue que pasó como se contó.',
  },
  {
    label: 'Desmentido con datos',
    instruction: 'Escribí un estribillo que corrija con números y fechas lo que afirma la estrofa.',
  },
  {
    label: 'Eufemismo',
    instruction: 'Escribí un estribillo que nombre con palabras suaves lo que la estrofa dice sin vueltas.',
  },
  {
    label: 'Voz del objeto',
    instruction: 'Escribí un estribillo contado por un objeto de la estrofa que desmiente a quien lo tiene.',
  },
  {
    label: 'Duda tardía',
    instruction: 'Escribí un estribillo donde la misma voz se arrepienta y ponga en duda cada cosa que dijo.',
  },
  {
    label: 'Versión oficial',
    instruction: 'Escribí un estribillo que cuente la escena como si la hubiera redactado alguien que quiere quedar bien.',
  },
];
