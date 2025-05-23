import {expect} from 'chai';
import {UndergroundDetonations} from '../../../src/server/cards/base/UndergroundDetonations';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('UndergroundDetonations', () => {
  let card: UndergroundDetonations;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new UndergroundDetonations();
    [game, player] = testGame(2);
  });

  it('Can not act', () => {
    player.megaCredits = 9;
    expect(card.canAct(player)).is.not.true;
  });

  it('Should act', () => {
    player.megaCredits = 10;
    expect(card.canAct(player)).is.true;

    card.action(player);
    game.deferredActions.runNext();
    expect(player.megaCredits).to.eq(0);
    expect(player.production.heat).to.eq(2);
  });
});
