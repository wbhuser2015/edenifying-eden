import {expect} from 'chai';
import {OceanSanctuary} from '../../../src/server/cards/ares/OceanSanctuary';
import {CuriosityII} from '../../../src/server/cards/community/CuriosityII';
import {IGame} from '../../../src/server/IGame';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {Phase} from '../../../src/common/Phase';
import {TileType} from '../../../src/common/TileType';
import {runAllActions, cast, testGame} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';

describe('CuriosityII', () => {
  let card: CuriosityII;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new CuriosityII();
    [game, player, player2] = testGame(2, {aresExtension: true, aresHazards: false});
    game.phase = Phase.ACTION;

    player.corporations.push(card);
    player.megaCredits = 2;
  });

  it('Can pay 2 M€ to draw card when placing a tile on a non-empty space', () => {
    const nonEmptySpace = game.board.getAvailableSpacesOnLand(player).find((space) => space.bonus.length > 0)!;
    game.addCity(player, nonEmptySpace);
    player.cardsInHand = [];

    expect(game.deferredActions).has.length(1);
    const orOptions = cast(game.deferredActions.pop()!.execute(), OrOptions);

    orOptions.options[1].cb(); // Do nothing
    expect(player.cardsInHand).is.empty;
    expect(player.megaCredits).to.eq(2);

    orOptions.options[0].cb(); // Pay 2 M€ to draw a card
    runAllActions(game);
    expect(player.cardsInHand).has.lengthOf(1);
    expect(player.megaCredits).to.eq(0);
  });

  it('Does not trigger when placing a tile on an empty space', () => {
    const emptySpace = game.board.getAvailableSpacesOnLand(player).find((space) => space.bonus.length === 0)!;
    game.addCity(player, emptySpace);
    runAllActions(game);

    expect(player.cardsInHand).is.empty;
    expect(player.megaCredits).to.eq(2);
  });

  it('Does not trigger when opponent places a tile', () => {
    const nonEmptySpace = game.board.getAvailableSpacesOnLand(player2).find((space) => space.bonus.length > 0)!;
    game.addCity(player2, nonEmptySpace);
    runAllActions(game);

    expect(player.cardsInHand).is.empty;
    expect(player.megaCredits).to.eq(2);
  });

  it('Placing a tile on top of another one triggers the bonus', () => {
    // particularly when the space bonus is empty.
    const oceanSpace = game.board.getAvailableSpacesForOcean(player2).find((space) => space.bonus.length === 0)!;
    game.board.getSpaceOrThrow(oceanSpace.id).tile = {tileType: TileType.OCEAN};

    const oceanSanctuary = new OceanSanctuary();
    oceanSanctuary.play(player);
    runAllActions(game);
    const action = cast(player.popWaitingFor(), SelectSpace);
    action.cb(oceanSpace);

    runAllActions(game);

    const orOptions = cast(player.popWaitingFor(), OrOptions);
    orOptions.options[0].cb(); // Pay 2 M€ to draw a card

    runAllActions(game);

    expect(player.cardsInHand).has.lengthOf(1);
    expect(player.megaCredits).to.eq(0);
  });
});
