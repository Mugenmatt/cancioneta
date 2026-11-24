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
import { DeadlineGame } from './DeadlineGame';
import { NarratorGame } from './NarratorGame';
import { RhymeMoldGame } from './RhymeMoldGame';
import { FormWheelGame } from './FormWheelGame';
import { FableGame } from './FableGame';
import { StolenSceneGame } from './StolenSceneGame';
import { VerseDissectionGame } from './VerseDissectionGame';
import { TenOpeningsGame } from './TenOpeningsGame';
import { StrangerStoryGame } from './StrangerStoryGame';
import { MutantProverbGame } from './MutantProverbGame';
import { OnlyQuestionsGame } from './OnlyQuestionsGame';
import { BackwardsGame } from './BackwardsGame';
import { TraitorChorusGame } from './TraitorChorusGame';
import { TwoVoicesGame } from './TwoVoicesGame';
import { TitleQuestionGame } from './TitleQuestionGame';
import { BadSongGame } from './BadSongGame';
import { G45Game } from './G45Game';
import { G46Game } from './G46Game';
import { G47Game } from './G47Game';
import { G51Game } from './G51Game';
import { G52Game } from './G52Game';
import { G53Game } from './G53Game';
import { ShotPlanGame } from './ShotPlanGame';
import { EmotionArcGame } from './EmotionArcGame';
import { MorningPagesGame, PromptGame, SpyGame, VoiceGame, WhyGame } from '../phase0';

export const RUNTIME_GAME_IDS = new Set([
  'f0-1', 'f0-2', 'f0-3', 'f0-4', 'f0-5',
  'g01', 'g03', 'g04', 'g06', 'g07', 'g08', 'g09', 'g10', 'g11', 'g12', 'g13',
  'g14', 'g15', 'g16', 'g17', 'g18', 'g19', 'g20', 'g21', 'g22', 'g23', 'g25',
  'g26', 'g27', 'g28', 'g29', 'g30', 'g32', 'g33', 'g34', 'g35', 'g36', 'g37', 'g38', 'g39', 'g41', 'g42', 'g43', 'g44', 'g45', 'g46', 'g47', 'g48', 'g49', 'g50', 'g51', 'g52', 'g53', 'g54', 'g55', 'g56', 'g57',
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
    case 'g33':
      return <DeadlineGame />;
    case 'g34':
      return <NarratorGame />;
    case 'g35':
      return <RhymeMoldGame />;
    case 'g36':
      return <FormWheelGame />;
    case 'g37':
      return <FableGame />;
    case 'g38':
      return <StolenSceneGame />;
    case 'g39':
      return <VerseDissectionGame />;
    case 'g41':
      return <TitleQuestionGame />;
    case 'g42':
      return <TenOpeningsGame />;
    case 'g43':
      return <StrangerStoryGame />;
    case 'g44':
      return <BadSongGame />;
    case 'g45':
      return <G45Game />;
    case 'g46':
      return <G46Game />;
    case 'g47':
      return <G47Game />;
    case 'g48':
      return <ShotPlanGame />;
    case 'g49':
      return <MutantProverbGame />;
    case 'g50':
      return <EmotionArcGame />;
    case 'g51':
      return <G51Game />;
    case 'g52':
      return <G52Game />;
    case 'g53':
      return <G53Game />;
    case 'g54':
      return <OnlyQuestionsGame />;
    case 'g55':
      return <BackwardsGame />;
    case 'g56':
      return <TraitorChorusGame />;
    case 'g57':
      return <TwoVoicesGame />;
    default:
      return null;
  }
}
