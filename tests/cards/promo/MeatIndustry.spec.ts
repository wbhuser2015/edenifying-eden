import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {EosChasmaNationalPark} from '../../../src/server/cards/base/EOSChasmaNationalPark';
import {Fish} from '../../../src/server/cards/base/Fish';
import {Predators} from '../../../src/server/cards/base/Predators';
import {MeatIndustry} from '../../../src/server/cards/promo/MeatIndustry';
import {runAllActions} from '../../TestingUtils';

describe('MeatIndustry', () => {
  it('Gives 2 M€ whenever player gains an animal', () => {
    const card = new MeatIndustry();
    const [game, player, player2] = testGame(2);

    player.playedCards.push(card);

    // Get 2 M€ when player gains animals
    const fish = new Fish();
    player.playedCards.push(fish);
    fish.action(player);
    runAllActions(game);
    expect(player.megaCredits).to.eq(2);

    const eosChasmaNationalPark = new EosChasmaNationalPark();
    eosChasmaNationalPark.play(player);
    runAllActions(game);
    expect(fish.resourceCount).to.eq(2);
    expect(player.megaCredits).to.eq(4);

    // Don't get MC when other players gain animals
    const predators = new Predators();
    player2.playedCards.push(predators);
    predators.action(player2);
    runAllActions(game);
    expect(player.megaCredits).to.eq(4);
  });
});
