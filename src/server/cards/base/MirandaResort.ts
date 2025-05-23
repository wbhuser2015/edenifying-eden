import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class MirandaResort extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MIRANDA_RESORT,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 12,
      victoryPoints: 1,

      behavior: {
        production: {provision: {tag: Tag.EARTH}},
      },

      metadata: {
        cardNumber: '051',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => {
            pb.provision(1).slash().tag(Tag.EARTH);
          });
        }),
        description: 'Increase your M€ production 1 step for each Earth tag you have.',
      },
    });
  }
}
