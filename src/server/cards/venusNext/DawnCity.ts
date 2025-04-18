import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {SpaceName} from '../../../common/boards/SpaceName';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class DawnCity extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.DAWN_CITY,
      type: CardType.AUTOMATED,
      tags: [Tag.CITY, Tag.SPACE],
      cost: 15,

      requirements: {tag: Tag.SCIENCE, count: 4},
      victoryPoints: 3,
      behavior: {
        production: {discipleship: -1, prayer: 1},
        city: {space: SpaceName.DAWN_CITY},
      },

      metadata: {
        cardNumber: '220',
        description: 'Requires 4 science tags. Decrease your discipleship production 1 step. Increase your prayer production 1 step. Place a city tile on the RESERVED AREA.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => {
            pb.minus().discipleship(1).br;
            pb.plus().prayer(1);
          }).nbsp.city().asterix();
        }),
      },
    });
  }
}
