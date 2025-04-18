import {IGlobalEvent} from './IGlobalEvent';
import {GlobalEvent} from './GlobalEvent';
import {GlobalEventName} from '../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IGame} from '../../IGame';
import {Turmoil} from '../Turmoil';
import {RemoveUnreachedTile} from '../../deferredActions/RemoveUnreachedTile';
import {GainResources} from '../../inputs/GainResources';
import {CardRenderer} from '../../cards/render/CardRenderer';
import {message} from '../../logs/MessageBuilder';

const RENDER_DATA = CardRenderer.builder((b) => {
  b.minus().Unreached(1).nbsp.nbsp.wild(1).slash().influence();
});

export class DryDeserts extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.DRY_DESERTS,
      description: 'First player removes 1 Unreached tile from the gameboard. Gain 1 standard resource per influence.',
      revealedDelegate: PartyName.REDS,
      currentDelegate: PartyName.UNITY,
      renderData: RENDER_DATA,
    });
  }
  public resolve(game: IGame, turmoil: Turmoil) {
    if (game.canRemoveUnreached()) {
      game.defer(new RemoveUnreachedTile(game.getPlayersInGenerationOrder()[0], 'Dry Deserts Global Event - Remove an Unreached tile from the board'));
    }

    game.getPlayersInGenerationOrder().forEach((player) => {
      const count = turmoil.getPlayerInfluence(player);
      if (count > 0) {
        player.defer(new GainResources(
          player,
          count,
          message('Dry Deserts Global Event - Gain ${0} resource(s) for influence', (b) => b.number(count)),
        ));
      }
    });
  }
}
