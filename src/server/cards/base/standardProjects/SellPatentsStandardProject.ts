import {IPlayer} from '../../../IPlayer';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {StandardProjectCard} from '../../StandardProjectCard';
import {SelectCard} from '../../../inputs/SelectCard';
import {IProjectCard} from '../../IProjectCard';

export class SellPatentsStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.SELL_PATENTS_STANDARD_PROJECT,
      cost: 0,
      metadata: {
        cardNumber: 'SP8',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Discard any number of cards to gain that amount of M€.', (eb) => {
            eb.text('X').cards(1).startAction.provision(1, {text: 'x'});
          }),
        ),
      },
    });
  }

  public override canAct(player: IPlayer): boolean {
    return player.cardsInHand.length > 0;
  }

  actionEssence(): void {
    // no-op
  }

  public override action(player: IPlayer): SelectCard<IProjectCard> {
    return new SelectCard(
      'Cancel Initiatives (Sell Cards)',
      'Cancel',
      player.cardsInHand,
      {max: player.cardsInHand.length, played: false})
      .andThen((cards) => {
        player.megaCredits += cards.length;
        cards.forEach((card) => player.discardCardFromHand(card));
        this.projectPlayed(player);
        player.game.log('${0} canceled ${1} initatives', (b) => b.player(player).number(cards.length));
        return undefined;
      });
  }
}
