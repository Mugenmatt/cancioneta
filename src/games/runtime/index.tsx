import type { ReactElement } from 'react';
import { AsociacionGame } from './AsociacionGame';
import { WordsGame } from './WordsGame';
import { PromptTools } from './PromptTools';
import { PortalGame } from './PortalGame';
import { SongsGame } from './SongsGame';
import { CardsGame } from './CardsGame';
import { InputGames } from './InputGames';
import { ImagesGame } from './ImagesGame';
import { SensoryGame } from './SensoryGame';
import { SeventhGame } from './SeventhGame';
import { MapGame } from './MapGame';
import { CollageGame } from './CollageGame';
import { CutupGame } from './CutupGame';
import { MorningPagesGame, PromptGame, SpyGame, VoiceGame, WhyGame } from '../phase0';

export const RUNTIME_GAME_IDS = new Set([
  'f0-1', 'f0-2', 'f0-3', 'f0-4', 'f0-5',
  'g01', 'g03', 'g04', 'g06', 'g07', 'g08', 'g09', 'g10', 'g11', 'g12', 'g13',
  'g14', 'g15', 'g16', 'g17', 'g18', 'g19', 'g20', 'g21', 'g22', 'g23', 'g25',
  'g26', 'g27', 'g28', 'g29', 'g30', 'g32',
]);

export function RuntimeGame({ id }: { id: string }): ReactElement | null {
  switch (id) {
    case 'f0-1':
      return <VoiceGame />;
    case 'f0-2':
      return <MorningPagesGame />;
    case 'f0-3':
      return <PromptGame />;
    case 'f0-4':
      return <SpyGame />;
    case 'f0-5':
      return <WhyGame />;
    case 'g01':
      return <AsociacionGame />;
    case 'g03':
    case 'g11':
      return <WordsGame id={id} />;
    case 'g04':
    case 'g07':
    case 'g12':
    case 'g14':
    case 'g22':
    case 'g32':
      return <PromptTools id={id} />;
    case 'g06':
      return <PortalGame />;
    case 'g08':
    case 'g09':
    case 'g10':
      return <SongsGame id={id} />;
    case 'g13':
    case 'g16':
    case 'g17':
    case 'g18':
      return <CardsGame id={id} />;
    case 'g15':
    case 'g25':
    case 'g26':
    case 'g27':
    case 'g30':
      return <InputGames id={id} />;
    case 'g19':
      return <ImagesGame />;
    case 'g20':
      return <SensoryGame />;
    case 'g21':
      return <SeventhGame />;
    case 'g23':
      return <MapGame />;
    case 'g28':
      return <CollageGame />;
    case 'g29':
      return <CutupGame />;
    default:
      return null;
  }
}
