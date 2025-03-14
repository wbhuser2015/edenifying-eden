import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {PartyName} from '../../../common/turmoil/PartyName';
import {CardRenderer} from '../render/CardRenderer';

export class PROffice extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PR_OFFICE,
      tags: [Tag.EARTH],
      cost: 7,

      behavior: {
        tr: 1,
        stock: {provision: {tag: Tag.EARTH}},
      },

      requirements: {party: PartyName.UNITY},
      metadata: {
        cardNumber: 'T09',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).br;
          b.provision(1).slash().tag(Tag.EARTH);
        }),
        description: 'Requires that Unity are ruling or that you have 2 delegates there. Gain 1 TR. Gain 1 M€ for each Earth tag you have, including this.',
      },
    });
  }
}
