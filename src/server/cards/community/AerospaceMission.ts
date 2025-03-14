import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardName} from '../../../common/cards/CardName';
import {BuildColony} from '../../deferredActions/BuildColony';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';

export class AerospaceMission extends PreludeCard {
  constructor() {
    super({
      name: CardName.AEROSPACE_MISSION,
      tags: [Tag.SPACE],
      startingMegacredits: -14,

      metadata: {
        cardNumber: 'Y01',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).nbsp.colonies(1).br;
          b.minus().provision(14);
        }),
        description: 'Place 2 colonies. Pay 14 M€.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.canAfford(14);
  }

  public override bespokePlay(player: IPlayer) {
    player.stock.deduct(Resource.MEGACREDITS, 14);
    player.game.defer(new BuildColony(player, {title: 'Select where to build the first colony'}));
    player.game.defer(new BuildColony(player, {title: 'Select where to build the second colony'}));
    return undefined;
  }
}
