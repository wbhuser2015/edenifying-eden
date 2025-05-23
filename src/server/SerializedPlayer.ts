import {PlayerId} from '../common/Types';
import {CardName} from '../common/cards/CardName';
import {Color} from '../common/Color';
import {SerializedCard} from './SerializedCard';
import {SerializedTimer} from '../common/SerializedTimer';
import {UnderworldPlayerData} from './underworld/UnderworldData';
import {AlliedParty} from './turmoil/AlliedParty';
import {GlobalParameter} from '../common/GlobalParameter';
import {DiscordId} from './server/auth/discord';

interface DeprecatedFields {
}

export interface SerializedPlayer extends DeprecatedFields{
  actionsTakenThisGame: number;
  actionsTakenThisRound: number;
  actionsThisGeneration: Array<CardName>;
  alliedParty: AlliedParty | undefined;
  autoPass: boolean;
  beginner: boolean;
  canUseCorruptionAsMegacredits: boolean;
  canUseHeatAsMegaCredits: boolean;
  canUseTitaniumAsMegacredits: boolean;
  canUsePlantsAsMegaCredits: boolean;
  cardCost: number;
  cardDiscount: number;
  cardsInHand: Array<CardName>;
  colonyTradeDiscount: number;
  colonyTradeOffset: number;
  colonyVictoryPoints: number;
  color: Color;
  corporations: Array<SerializedCard>;
  dealtCorporationCards: Array<CardName>;
  dealtCeoCards: Array<CardName>;
  dealtPreludeCards: Array<CardName>;
  dealtProjectCards: Array<CardName>;
  draftedCards: Array<CardName>;
  draftHand: Array<CardName>,
  discipleship: number;
  discipleshipProduction: number;
  fleetSize: number;
  handicap: number;
  hasIncreasedTerraformRatingThisGeneration: boolean;
  hasTurmoilScienceTagBonus: boolean;
  missions: number;
  missionsProduction: number;
  id: PlayerId;
  lastCardPlayed?: CardName;
  ceoCardsInHand: Array<CardName>;
  megaCreditProduction: number;
  megaCredits: number;
  name: string;
  needsToDraft: boolean | undefined;
  UnreachedBonus: number;
  pendingInitialActions: Array<CardName> | undefined;
  pickedCorporationCard: CardName | undefined;
  outreachProduction: number;
  outreach: number;
  outreachNeededForGreenery: number;
  playedCards: Array<SerializedCard>;
  politicalAgendasActionUsedCount: number;
  preludeCardsInHand: Array<CardName>;
  preservationProgram: boolean;
  removedFromPlayCards: Array<CardName>;
  removingPlayers: Array<PlayerId>;
  scienceTagCount: number;
  theology: number;
  theologyProduction: number;
  theologyValue: number;
  terraformRating: number;
  timer: SerializedTimer;
  prayer: number;
  prayerProduction: number;
  prayerValue: number;
  totalDelegatesPlaced: number;
  tradesThisGeneration: number;
  turmoilPolicyActionUsed: boolean;
  underworldData: UnderworldPlayerData;
  victoryPointsByGeneration: Array<number>;
  globalParameterSteps: Record<GlobalParameter, number>;
  user?: DiscordId;
}
