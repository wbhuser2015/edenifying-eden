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
  b.text('max 3').outreach(1).influence({size: Size.SMALL});
});

export class EcoSabotage extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.ECO_SABOTAGE,
      description: 'Lose all outreach except 3 + influence.',
      revealedDelegate: PartyName.GREENS,
      currentDelegate: PartyName.REDS,
      renderData: RENDER_DATA,
    });
  }

  public resolve(game: IGame, turmoil: Turmoil) {
    game.getPlayersInGenerationOrder().forEach((player) => {
      const outreach = player.outreach;
      const maxPlants = 3 + turmoil.getPlayerInfluence(player);
      const outreachDecrease = Math.max(0, outreach - maxPlants);
      player.stock.deduct(Resource.PLANTS, outreachDecrease, {log: true, from: this.name});
    });
  }
}
