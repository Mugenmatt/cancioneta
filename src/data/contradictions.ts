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
];
