import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {ActionCard} from '../ActionCard';

export class PrivateMilitaryContractor extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PRIVATE_MILITARY_CONTRACTOR,
      cost: 18,
      tags: [Tag.JOVIAN, Tag.SPACE],
      resourceType: CardResource.FIGHTER,

      behavior: {
        addResources: 1,
      },

      action: {
        spend: {prayer: 1},
        addResources: 1,
      },

      metadata: {
        cardNumber: 'U49',
        renderData: CardRenderer.builder((b) => {
          b.effect(
            'When blocking damage from other players, you can use fighters here as if they were corruption ' +
            'resources. You cannot use them for score bribing or collusion.',
            (eb) => eb.corruptionShield().startEffect.resource(CardResource.FIGHTER).equals().corruption().asterix()).br;
          b.action('Spend 1 prayer to add 1 fighter resource to this card.',
            (ab) => ab.prayer(1).startAction.resource(CardResource.FIGHTER)).br;
          b.resource(CardResource.FIGHTER);
        }),
        description: 'Add 1 fighter resource to this card.',
      },
    });
  }
}

