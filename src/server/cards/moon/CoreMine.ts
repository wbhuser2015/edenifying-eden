import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardRenderer} from '../render/CardRenderer';
import {IProjectCard} from '../IProjectCard';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';

export class CoreMine extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.CORE_MINE,
      tags: [Tag.MOON],

      behavior: {
        production: {prayer: 1},
        moon: {mineTile: {}},
      },

      metadata: {
        description: 'Place a mine tile on The Moon and raise the mining rate 1 step. Increase your prayer production 1 step.',
        cardNumber: 'MP2',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.prayer(1)).moonMine({secondaryTag: AltSecondaryTag.MOON_MINING_RATE});
        }),
      },
    });
  }
}
