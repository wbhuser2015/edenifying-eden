import {IGlobalEvent} from './IGlobalEvent';
import {GlobalEvent} from './GlobalEvent';
import {GlobalEventName} from '../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IGame} from '../../IGame';
import {Resource} from '../../../common/Resource';
import {Turmoil} from '../Turmoil';
import {CardRenderer} from '../../cards/render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';

const RENDER_DATA = CardRenderer.builder((b) => {
  b.outreach(1).slash().production((pb) => pb.outreach(1)).nbsp.influence({size: Size.SMALL});
});


export class SuccessfulOrganisms extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.SUCCESSFUL_ORGANISMS,
      description: 'Gain 1 outreach per outreach production (max 5) and influence.',
      revealedDelegate: PartyName.MARS,
      currentDelegate: PartyName.SCIENTISTS,
      renderData: RENDER_DATA,
    });
  }
  public resolve(game: IGame, turmoil: Turmoil) {
    game.getPlayersInGenerationOrder().forEach((player) => {
      player.stock.add(Resource.PLANTS, Math.min(5, player.production.outreach) + turmoil.getPlayerInfluence(player), {log: true, from: this.name});
    });
  }
}
