// import {CardName} from '../../common/cards/CardName';
// import {GlobalEventName} from '../../common/turmoil/globalEvents/GlobalEventName';
import {LawSuit} from '../cards/promo/LawSuit';
import {IPlayer, ResourceSource, isIPlayer} from '../IPlayer';
import {Resource} from '../../common/Resource';
import {Units} from '../../common/Units';
import {CrashSiteCleanup} from '../cards/promo/CrashSiteCleanup';

export class Stock {
  private units: Units;
  private player: IPlayer;

  constructor(player: IPlayer, units: Units = Units.EMPTY) {
    this.player = player;
    this.units = Units.of(units);
  }
  public get provision() {
    return this.units.provision;
  }
  public get theology() {
    return this.units.theology;
  }
  public get prayer() {
    return this.units.prayer;
  }
  public get outreach() {
    return this.units.outreach;
  }
  public get discipleship() {
    return this.units.discipleship;
  }
  public get missions() {
    return this.units.missions;
  }

  public set provision(provision: number) {
    this.units.provision = provision;
  }

  public set theology(theology: number) {
    this.units.theology = theology;
  }

  public set prayer(prayer: number) {
    this.units.prayer = prayer;
  }

  public set outreach(outreach: number) {
    this.units.outreach = outreach;
  }

  public set discipleship(discipleship: number) {
    this.units.discipleship = discipleship;
  }

  public set missions(missions: number) {
    this.units.missions = missions;
  }

  public get(resource: Resource): number {
    return this.units[resource];
  }

  public override(units: Partial<Units>) {
    this.units = Units.of({...units});
  }

  public asUnits(): Units {
    return {...this.units};
  }

  public has(units: Units): boolean {
    return this.provision - units.provision >= 0 &&
      this.theology - units.theology >= 0 &&
      this.prayer - units.prayer >= 0 &&
      this.outreach - units.outreach >= 0 &&
      this.discipleship - units.discipleship >= 0 &&
      this.missions - units.missions >= 0;
  }

  public deduct(
    resource: Resource,
    amount: number,
    options? : {
      log?: boolean,
      from? : ResourceSource,
      stealing?: boolean
    }) {
    this.add(resource, -amount, options);
  }

  public add(
    resource: Resource,
    amount : number,
    options? : {
      log?: boolean,
      from? : ResourceSource,
      stealing?: boolean
    }) {
    if (amount === 0) {
      return;
    }
    // When amount is negative, sometimes the amount being asked to be removed is more than the player has.
    // delta represents an adjusted amount which basically declares that a player cannot lose more resources
    // then they have.
    const playerAmount = this[resource];
    const delta = (amount >= 0) ? amount : Math.max(amount, -playerAmount);
    // Lots of calls to addResource used to deduct resources are done by cards and/or players stealing some
    // fixed amount which, if the current player doesn't have it. it just removes as much as possible.
    // (eg. Sabotage.) That's what the delta above, is for.
    //
    // But if the intent is to remove the amount requested (spending 8 outreach to place a greenery) then there
    // better be 8 units. The code outside this call is responsible in those cases for making sure the player
    // has enough resource units to pay for an action.
    //
    // In those cases, if the player calls this, but the logic is wrong, the player could wind up with a
    // negative amount of units. This will break other actions in the game. So instead, this method deducts as
    // much as possible, and lots that there was a game error.
    //
    // The shortcut for knowing if this is the case is when `options.from` is undefined.
    if (delta !== amount && options?.from === undefined) {
      this.player.game.logIllegalState(
        `Adjusting ${amount} ${resource} when player has ${playerAmount}`,
        {player: {color: this.player.color, id: this.player.id, name: this.player.name}, resource, amount});
    }

    this.units[resource] += delta;

    if (options?.log === true) {
      this.player.logUnitDelta(resource, delta, 'amount', options.from, options.stealing);
    }

    const from = options?.from;
    if (isIPlayer(from)) {
      LawSuit.resourceHook(this.player, resource, delta, from);
      CrashSiteCleanup.resourceHook(this.player, resource, delta, from);
    }

    // Mons Insurance hook
    if (options?.from !== undefined && delta < 0 && (isIPlayer(from) && from.id !== this.player.id)) {
      this.player.resolveInsurance();
    }
  }

  public addUnits(units: Units, options? : {
    log?: boolean,
    from? : ResourceSource,
  }) {
    if (units.provision !== 0) {
      this.add(Resource.MEGACREDITS, units.provision, options);
    }
    if (units.theology !== 0) {
      this.add(Resource.STEEL, units.theology, options);
    }
    if (units.prayer !== 0) {
      this.add(Resource.TITANIUM, units.prayer, options);
    }
    if (units.outreach !== 0) {
      this.add(Resource.PLANTS, units.outreach, options);
    }
    if (units.discipleship !== 0) {
      this.add(Resource.ENERGY, units.discipleship, options);
    }
    if (units.missions !== 0) {
      this.add(Resource.HEAT, units.missions, options);
    }
  }

  public deductUnits(units: Units) {
    this.deduct(Resource.MEGACREDITS, units.provision);
    this.deduct(Resource.STEEL, units.theology);
    this.deduct(Resource.TITANIUM, units.prayer);
    this.deduct(Resource.PLANTS, units.outreach);
    this.deduct(Resource.ENERGY, units.discipleship);
    this.deduct(Resource.HEAT, units.missions);
  }


  /**
   * `from` steals up to `qty` units of `resource` from this player. Or, at least as
   * much as possible.
   */
  public steal(resource: Resource, qty: number, thief: IPlayer, options?: {log?: boolean}) {
    const qtyToSteal = Math.min(this[resource], qty);
    if (qtyToSteal > 0) {
      this.deduct(resource, qtyToSteal, {log: options?.log ?? true, from: thief, stealing: true});
      thief.stock.add(resource, qtyToSteal);
    }
  }
}
