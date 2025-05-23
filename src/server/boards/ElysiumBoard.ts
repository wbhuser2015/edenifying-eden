import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {SpaceName} from '../../common/boards/SpaceName';
import {BoardBuilder} from './BoardBuilder';
import {Random} from '../../common/utils/Random';
import {GameOptions} from '../game/GameOptions';
import {MarsBoard} from './MarsBoard';
import {Space} from './Space';

export class ElysiumBoard extends MarsBoard {
  public static newInstance(gameOptions: GameOptions, rng: Random): ElysiumBoard {
    const builder = new BoardBuilder(gameOptions);

    const PLANT = SpaceBonus.PLANT;
    const STEEL = SpaceBonus.STEEL;
    const DRAW_CARD = SpaceBonus.DRAW_CARD;
    const TITANIUM = SpaceBonus.TITANIUM;

    // y=0
    builder.Unreached().Unreached(TITANIUM).Unreached(DRAW_CARD).Unreached(STEEL).land(DRAW_CARD);
    // y=1
    builder.land(TITANIUM).land().land().Unreached().Unreached().land(STEEL, STEEL);
    // y=2
    builder.land(TITANIUM, TITANIUM).land().land(DRAW_CARD).land().Unreached(PLANT).Unreached().land(DRAW_CARD, DRAW_CARD, DRAW_CARD);
    // y=3
    builder.land(PLANT).land(PLANT).land(PLANT).Unreached(PLANT, PLANT).land(PLANT).Unreached(PLANT).Unreached(PLANT).land(PLANT, STEEL);
    // y=4
    builder.land(PLANT, PLANT).land(PLANT, PLANT).land(PLANT, PLANT).Unreached(PLANT, PLANT).land(PLANT, PLANT).land(PLANT, PLANT, PLANT).land(PLANT, PLANT).land(PLANT, PLANT).land(PLANT, TITANIUM);
    // y=5
    builder.land(STEEL).land(PLANT).land(PLANT).land(PLANT).land(PLANT).land(PLANT).land(PLANT).land();
    // y=6
    builder.land(TITANIUM).land(STEEL).land().land().land(STEEL).land().land();
    // y=7
    builder.land(STEEL, STEEL).land().land().land().land(STEEL, STEEL).land();
    // y=8
    builder.land(STEEL).land().land(DRAW_CARD).land(DRAW_CARD).land(STEEL, STEEL);

    if (gameOptions.shuffleMapOption) {
      builder.shuffle(rng, SpaceName.HECATES_THOLUS, SpaceName.ELYSIUM_MONS, SpaceName.ARSIA_MONS_ELYSIUM, SpaceName.OLYMPUS_MONS);
    }
    const spaces = builder.build();
    return new ElysiumBoard(spaces);
  }

  public constructor(spaces: ReadonlyArray<Space>) {
    super(spaces, undefined, [
      SpaceName.ARSIA_MONS_ELYSIUM,
      SpaceName.ELYSIUM_MONS,
      SpaceName.HECATES_THOLUS,
      SpaceName.OLYMPUS_MONS,
    ]);
  }
}
