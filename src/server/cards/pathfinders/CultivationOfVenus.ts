import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tag} from '../../../common/cards/Tag';

export class CultivationOfVenus extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.CULTIVATION_OF_VENUS,
      cost: 18,
      tags: [Tag.PLANT, Tag.VENUS],
      victoryPoints: {tag: Tag.VENUS, per: 2},

      action: {
        spend: {outreach: 3},
        global: {venus: 1},
        //   player.game.log('${0} spent 3 outreach to raise the Venus level 1 step', (b) => b.player(player));
      },

      metadata: {
        cardNumber: 'Pf45',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 3 outreach to raise Venus 1 step.', (eb) => {
            eb.outreach(3).startAction.venus(1);
          }).br;
        }),
        description: '1 VP for every 2 Venus tags you own.',
      },
    });
  }
}

