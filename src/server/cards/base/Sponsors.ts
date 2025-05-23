import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class Sponsors extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SPONSORS,
      tags: [Tag.EARTH],
      cost: 6,

      behavior: {
        production: {provision: 2},
      },

      metadata: {
        cardNumber: '068',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.provision(2));
        }),
        description: 'Increase your M€ production 2 steps.',
      },
    });
  }
}
