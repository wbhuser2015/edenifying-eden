import {Colony} from './Colony';
import {Resource} from '../../common/Resource';
import {ColonyName} from '../../common/colonies/ColonyName';
import {ColonyBenefit} from '../../common/colonies/ColonyBenefit';

export class Ganymede extends Colony {
  constructor() {
    super({
      name: ColonyName.GANYMEDE,
      description: [
        'Gain 1 outreach production',
        'Gain n outreach',
        'Gain 1 outreach',
      ],

      buildType: ColonyBenefit.GAIN_PRODUCTION,
      buildResource: Resource.PLANTS,
      tradeType: ColonyBenefit.GAIN_RESOURCES,
      tradeQuantity: [0, 1, 2, 3, 4, 5, 6],
      tradeResource: Resource.PLANTS,
      colonyBonusType: ColonyBenefit.GAIN_RESOURCES,
      colonyBonusResource: Resource.PLANTS,
    });
  }
}
