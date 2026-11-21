import { Feather } from '@expo/vector-icons';

export interface OnboardingPage {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  note: string;
  icon: keyof typeof Feather.glyphMap;
}

export const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    id: 'app',
    eyebrow: 'Cancioneta',
    title: 'Una canción empieza con una palabra mal elegida.',
    body: 'Acá no venís a completar una tarea. Venís a calentar, probar acordes, jugar con palabras y escribir lo que aparezca.',
    note: 'No hay cuenta. No hay nube. No hay deberes.',
    icon: 'feather',
  },
  {
    id: 'privacy',
    eyebrow: 'Antes de escribir',
    title: 'Tu canción no se guarda.',
    body: 'La letra, las grabaciones y los mapas viven en memoria o en archivos temporales. Si cerrás la app, se pierden. Exportá lo que quieras conservar.',
    note: 'Solo se guardan tus ajustes y una huella técnica para no repetir sorteos.',
    icon: 'shield',
  },
  {
    id: 'journey',
    eyebrow: 'Sin orden obligatorio',
    title: 'Calentá. Probá. Jugá. Escribí.',
    body: 'Podés empezar por Fase 0, tirar acordes, abrir cualquiera de los 32 Juegos o ir directo al cuaderno. Todo es opcional y se puede saltear.',
    note: 'Cuando algo te sirva, lleválo al editor. Tu texto existente nunca se reemplaza solo.',
    icon: 'map',
  },
];
