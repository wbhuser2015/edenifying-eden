import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class OrbitalReflectors extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.ORBITAL_REFLECTORS,
      type: CardType.AUTOMATED,
      tags: [Tag.VENUS, Tag.SPACE],
      cost: 26,

      behavior: {
        production: {missions: 2},
        global: {venus: 2},
      },

      metadata: {
        cardNumber: '242',
        renderData: CardRenderer.builder((b) => {
          b.venus(2).br;
          b.production((pb) => {
            pb.missions(2);
          });
        }),
        description: 'Raise Venus 2 steps. Increase your missions production 2 steps.',
      },
    });
  }
}
