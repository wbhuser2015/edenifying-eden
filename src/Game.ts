
import { Player } from "./Player";
import { Dealer } from "./Dealer";
import { ISpace } from "./ISpace";
import { SpaceType } from "./SpaceType";
import { TileType } from "./TileType";
import { SpaceBonus } from "./SpaceBonus";
import { ITile } from "./ITile";
import { IProjectCard } from "./cards/IProjectCard";
import { BeginnerCorporation } from "./cards/corporation/BeginnerCorporation";
import { CorporationCard } from "./cards/corporation/CorporationCard";
import { OriginalBoard } from "./OriginalBoard";
import { SelectCard } from "./inputs/SelectCard";
import { SelectSpace } from "./inputs/SelectSpace";
import { SpaceName } from "./SpaceName";
import { AndOptions } from "./inputs/AndOptions";
import { PlayerInput } from "./PlayerInput";
import { Phase } from "./Phase";
import { Award } from "./Award";
import { Tags } from "./cards/Tags";
import { ClaimedMilestone } from "./ClaimedMilestone";
import { FundedAward } from "./FundedAward";
import { Milestone } from "./Milestone";
import { ResourceType } from "./ResourceType";
import * as constants from "./constants";
import { Color } from "./Color";

import { ALL_CORPORATION_CARDS } from "./Dealer";

export class Game {
    public activePlayer: Player;
    public claimedMilestones: Array<ClaimedMilestone> = [];
    public dealer: Dealer = new Dealer();
    public fundedAwards: Array<FundedAward> = []; 
    public generation: number = 1;
    public phase: Phase = Phase.RESEARCH;
    private donePlayers: Set<Player> = new Set<Player>();
    private oxygenLevel: number = constants.MIN_OXYGEN_LEVEL;
    private passedPlayers: Set<Player> = new Set<Player>();
    private researchedPlayers: Set<Player> = new Set<Player>();
    private originalBoard = new OriginalBoard();
    private spaces: Array<ISpace> = this.originalBoard.spaces;
    private temperature: number = constants.MIN_TEMPERATURE;

    constructor(public id: string, private players: Array<Player>, private first: Player) {
        this.activePlayer = first;
        // Single player game player starts with 14TR and 2 neutral cities and forests on board
        if (players.length === 1) {
            this.setupSolo();
        }
        const corporationCards = this.dealer.shuffleCards(ALL_CORPORATION_CARDS);
        // Give each player their corporation cards
        for (let player of players) {
            if (!player.beginner) {
                player.dealtCorporationCards = [
                    corporationCards.pop(),
                    corporationCards.pop()
                ];
                player.setWaitingFor(this.pickCorporationCard(player));
            } else {
                this.playCorporationCard(player, new BeginnerCorporation());
            }
        }
        
    }

    public getSpaceByTileCard(cardName: string): ISpace | undefined {
        return this.spaces.find((space) => space.tile !== undefined && space.tile.card === cardName);
    }

    public milestoneClaimed(milestone: Milestone): boolean {
        return this.claimedMilestones.find((claimedMilestone) => claimedMilestone.milestone === milestone) !== undefined;
    }

    private marsIsTerraformed(): boolean {
        return this.oxygenLevel >= constants.MAX_OXYGEN_LEVEL && this.temperature >= constants.MAX_TEMPERATURE &&
            this.getOceansOnBoard() === constants.MAX_OCEAN_TILES;
    }

    public getAwardFundingCost(): number {
        return 8 + (6 * this.fundedAwards.length);
    }

    public fundAward(player: Player, award: Award): void {
        if (this.allAwardsFunded()) {
            throw "All awards already funded";
        }
        this.fundedAwards.push({
            award: award,
            player: player
        });
    }

    public giveAward(award: Award): void {
        const players: Array<Player> = this.players.slice();
        let getScore: (player: Player) => number;
        // Most tiles in play
        if (award === Award.LANDLORD) {
            getScore = (player: Player) => {
                return this.spaces.filter((space) => space.tile !== undefined && space.tile.tileType !== TileType.OCEAN && space.player === player).length;
            };
        }
        // Highest megacredit production
        else if (award === Award.BANKER) {
            getScore = (player: Player) => {
                return player.megaCreditProduction;
            };
        }
        // Most science tags in play
        else if (award === Award.SCIENTIST) {
            getScore = (player: Player) => {
                return player.getTagCount(Tags.SCIENCE);
            };
        }
        // Most heat resources
        else if (award === Award.THERMALIST) {
            getScore = (player: Player) => {
                return player.heat;
            };
        }
        // Most STEEL and TITANIUM resources
        else if (award === Award.MINER) {
            getScore = (player: Player) => {
                return player.steel + player.titanium;
            };
        } else {
            throw "Unsupported award " + award;
        }
        players.sort((player1, player2) => getScore(player2) - getScore(player1));
        if (getScore(players[0]) > getScore(players[1])) {
            players[0].victoryPoints += 5;
            players.shift();
            if (players.length > 1) {
                if (getScore(players[0]) > getScore(players[1])) {
                    players[0].victoryPoints += 3;
                }  else {  // We have at least 2 rank 2 players
                    let score = getScore(players[0]);
                    while (getScore(players[0]) === score) {
                        players[0].victoryPoints += 3;
                        players.shift();
                    }                
                }
            }    
        } else { // We have at least 2 rank 1 players 
            let score = getScore(players[0]);
            while (getScore(players[0]) === score) {
                players[0].victoryPoints += 5;
                players.shift();
            }
        }
    }

    public hasBeenFunded(award: Award): boolean {
        return this.fundedAwards.find((fundedAward) => fundedAward.award === award) !== undefined;
    }

    public allAwardsFunded(): boolean {
        return this.fundedAwards.length > 2;
    }

    public allMilestonesClaimed(): boolean {
        return this.claimedMilestones.length > 2;
    }

    private playCorporationCard(player: Player, corporationCard: CorporationCard): void {
        player.corporationCard = corporationCard;
        corporationCard.play(player, this);
        player.megaCredits = corporationCard.startingMegaCredits;
        if (corporationCard.name !== new BeginnerCorporation().name) {
            player.megaCredits -= player.cardsInHand.length * constants.CARD_COST;
        }
        this.playerIsFinishedWithResearchPhase(player);
    }

    private pickCorporationCard(player: Player): PlayerInput {
        const dealtCards: Array<IProjectCard> = [
            this.dealer.dealCard(),
            this.dealer.dealCard(),
            this.dealer.dealCard(),
            this.dealer.dealCard(),
            this.dealer.dealCard(),
            this.dealer.dealCard(),
            this.dealer.dealCard(),
            this.dealer.dealCard(),
            this.dealer.dealCard(),
            this.dealer.dealCard()
        ];
        let corporation: CorporationCard;
        return new AndOptions(
            () => {
                this.playCorporationCard(player, corporation);
                return undefined;
            },
            new SelectCard<CorporationCard>("Select corporation", player.dealtCorporationCards, (foundCards: Array<CorporationCard>) => {
                corporation = foundCards[0];
                return undefined;
            }),
            new SelectCard("Select initial cards to buy", dealtCards, (foundCards: Array<IProjectCard>) => {
                // Pay for cards
                for (let foundCard of foundCards) {
                    player.cardsInHand.push(foundCard);
                }
                for (let dealtCard of dealtCards) {
                    if (foundCards.find((foundCard) => foundCard.name === dealtCard.name) === undefined) {
                        this.dealer.discard(dealtCard);
                    }
                }
                return undefined;
            }, 10, 0)
        );
    }
 
    private hasPassedThisActionPhase(player: Player): boolean {
        return this.passedPlayers.has(player);
    }

    private incrementFirstPlayer(): void {
        let firstIndex: number = this.players.indexOf(this.first);
        if (firstIndex === -1) {
            throw "Didn't even find player";
        }
        if (firstIndex === this.players.length - 1) {
            firstIndex = 0;
        } else {
            firstIndex++;
        }
        this.first = this.players[firstIndex];
    }

    private dealEachPlayer4Cards(): void {
        this.players.forEach((player) => {
            player.runResearchPhase(this);
        });
    }

    private gotoResearchPhase(): void {
        this.generation++;
        this.players.forEach((player) => {
            player.terraformRatingAtGenerationStart = player.terraformRating;
        });
        this.incrementFirstPlayer();
        this.dealEachPlayer4Cards();
    }

    private gameIsOver(): boolean {
        // Single player game is done after generation 14
        if (this.players.length === 1 && this.generation === 14) {
            return true;
        }
        return this.marsIsTerraformed();
    }

    private gotoProductionPhase(): void {
        this.passedPlayers.clear();
        this.players.forEach((player) => {
            player.runProductionPhase();
        });
        if (this.gameIsOver()) {
            this.gotoFinalGreeneryPlacement();
        } else {
            this.gotoResearchPhase();
        }
    }

    private allPlayersHavePassed(): boolean {
        for (const player of this.players) {
            if (!this.hasPassedThisActionPhase(player)) {
                return false;
            }
        }
        return true;
    }

    public playerHasPassed(player: Player): void {
        this.passedPlayers.add(player);
        if (this.allPlayersHavePassed()) {
            this.gotoProductionPhase();
        } else {
            this.playerIsFinishedTakingActions(player);
        }
    }

    private hasResearched(player: Player): boolean {
        return this.researchedPlayers.has(player);
    }

    private playerHasSpace(player: Player): boolean {
        return this.getAllSpaces().find((space) => space.tile !== undefined && space.player === player && space.tile.tileType !== TileType.OCEAN) !== undefined;
    }

    public getAvailableSpacesForGreenery(player: Player): Array<ISpace> {
        // Greenery must be placed by a space you own if you own a space
        if (this.playerHasSpace(player)) {
            return this.getAvailableSpacesOnLand(player)
                                .filter((space) => this.getAdjacentSpaces(space).find((adjacentSpace) => adjacentSpace.tile !== undefined && adjacentSpace.tile.tileType !== TileType.OCEAN && adjacentSpace.player === player) !== undefined);
        }
        // Place anywhere if no space owned
        return this.getAvailableSpacesOnLand(player);
    }

    public getAvailableSpacesOnLand(player: Player): Array<ISpace> {
        return this.getSpaces(SpaceType.LAND)
                .filter((space) => space.id !== SpaceName.NOCTIS_CITY) // Can only place noctis city on reserved space
                .filter((space) => space.tile === undefined && (space.player === undefined || space.player === player));
    }

    public getAvailableSpacesForOcean(player: Player): Array<ISpace> {
        return this.getSpaces(SpaceType.OCEAN)
                .filter((space) => space.tile === undefined && (space.player === undefined || space.player === player));
    }

    private allPlayersHaveFinishedResearch(): boolean {
        for (const player of this.players) {
            if (!this.hasResearched(player)) {
                return false;
            }
        }
        return true;
    }

    public playerIsFinishedWithResearchPhase(player: Player): void {
        this.researchedPlayers.add(player);
        if (this.allPlayersHaveFinishedResearch()) {
            this.gotoActionPhase();
        }
    }

    private getNextPlayer(players: Array<Player>, player: Player): Player | undefined {
        const playerIndex: number = players.indexOf(player);

        // The player was not found
        if (playerIndex === -1) {
            return undefined;
        }

        // Go to the beginning of the array if we reached the end
        return players[(playerIndex + 1 >= players.length) ? 0 : playerIndex + 1];
    }

    public playerIsFinishedTakingActions(player: Player): void {
        const nextPlayer = this.getNextPlayer(this.players, player);

        if (nextPlayer === undefined) {
            throw "Did not find player";
        }

        if (!this.hasPassedThisActionPhase(nextPlayer)) {
            this.startActionsForPlayer(nextPlayer);
        }

    }

    private gotoActionPhase(): void {
        this.phase = Phase.ACTION;
        this.passedPlayers.clear();
        this.startActionsForPlayer(this.first);
    }

    private gotoEndGame(): void {
        this.phase = Phase.END;

        // Give players any victory points from cards
        this.players.forEach((player) => {
            player.playedCards.forEach((playedCard) => {
                if (playedCard.onGameEnd !== undefined) {
                    playedCard.onGameEnd(player, this);
                }
            });
        });

        // Distribute awards
        this.fundedAwards.forEach((fundedAward) => {
            this.giveAward(fundedAward.award);
        });

        const spaces = this.getAllSpaces();
        spaces.forEach((space) => {
            // Give victory point for each greenery tile
            if (space.tile && space.tile.tileType === TileType.GREENERY && space.player) {
                space.player.victoryPoints++;
            }
            // Give victory point for each greenery adjacent to city tile
            if (space.tile && space.tile.tileType === TileType.CITY && space.player !== undefined) {
                const adjacentSpaces = this.getAdjacentSpaces(space);
                for (let adjacentSpace of adjacentSpaces) {
                    if (adjacentSpace.tile && adjacentSpace.tile.tileType === TileType.GREENERY && adjacentSpace.player) {
                        space.player.victoryPoints++;
                    }
                }
            }
        });

    }

    public canPlaceGreenery(player: Player): boolean {
        return !this.donePlayers.has(player) && player.plants >= player.plantsNeededForGreenery && this.getAvailableSpacesForGreenery(player).length > 0;
    }

    public playerIsDoneWithGame(player: Player): void {
        this.donePlayers.add(player);
        this.gotoFinalGreeneryPlacement();
    }

    private gotoFinalGreeneryPlacement(): void {
        const playersWhoCanPlaceGreeneries = this.players.filter((player) => this.canPlaceGreenery(player));
        // If no players can place greeneries we are done
        if (playersWhoCanPlaceGreeneries.length === 0) {
            this.gotoEndGame();
            return;
        }

        // iterate through players in order and allow them to convert plants
        // into greenery if possible, there needs to be spaces available for
        // greenery and the player needs enough plants
        let firstPlayer: Player | undefined = this.first;
        while (firstPlayer !== undefined && playersWhoCanPlaceGreeneries.indexOf(firstPlayer) === -1) {
            firstPlayer = this.getNextPlayer(playersWhoCanPlaceGreeneries, firstPlayer);
        }

        if (firstPlayer !== undefined) {
            this.startFinalGreeneryPlacement(firstPlayer);
        } else {
            throw "Was no player left to place final greenery";
        }
    }

    private startFinalGreeneryPlacement(player: Player) {
        this.activePlayer = player;
        player.takeActionForFinalGreenery(this);
    }

    private startActionsForPlayer(player: Player) {
        this.activePlayer = player;
        player.takeAction(this);
    }

    public increaseOxygenLevel(player: Player, steps: 1 | 2): SelectSpace | undefined {
        if (this.oxygenLevel >= constants.MAX_OXYGEN_LEVEL) {
            return undefined;
        }
        this.oxygenLevel += steps;
        player.terraformRating += steps;
        if (this.oxygenLevel === 8 || (steps === 2 && this.oxygenLevel === 9)) {
            return this.increaseTemperature(player, 1);
        }
        return undefined;
    }

    public getOxygenLevel(): number {
        return this.oxygenLevel;
    }

    public increaseTemperature(player: Player, steps: 1 | 2 | 3): SelectSpace | undefined {
        if (this.temperature >= constants.MAX_TEMPERATURE) {
            return undefined;
        }
        this.temperature += 2 * steps;
        player.terraformRating += steps;
        // BONUS FOR HEAT PRODUCTION AT -20 and -24
        // BONUS FOR OCEAN TILE AT 0
        if (steps === 3 && this.temperature === -20) {
            player.heatProduction += 2;
        } else if (this.temperature === -24 || this.temperature === -20 ||
            ((steps === 2 || steps === 3) && (this.temperature === -22 || this.temperature === -18)) ||
            (steps === 3 && this.temperature === -16)
        ) {
            player.heatProduction++;
        } else if ((this.temperature === 0 || ((steps === 2 || steps === 3) && this.temperature === 2) || (steps === 3 && this.temperature === 4)) && this.getOceansOnBoard() < constants.MAX_OCEAN_TILES){
            return new SelectSpace("Select space for ocean from temperature increase", this.getAvailableSpacesForOcean(player), (space: ISpace) => {
                this.addOceanTile(player, space.id);
                return undefined;
            });
        } 
        return undefined;
    }

    public getTemperature(): number {
        return this.temperature;
    }

    public getGeneration(): number {
        return this.generation;
    }

    public getPlayer(name: string): Player {
        const foundPlayers = this.players.filter((player) => player.name === name);
        if (foundPlayers.length === 0) {
            throw "Player not found";
        }
        return foundPlayers[0];
    }

    public getAllSpaces(): Array<ISpace> {
        return this.spaces;
    }

    public getSpace(id: string): ISpace {
        const matchedSpaces = this.spaces.filter((space) => space.id === id);
        if (matchedSpaces.length === 1) {
            return matchedSpaces[0];
        }
        throw "Error with getting space";
    }
    public getCitiesInPlayOnMars(): number {
        return this.spaces.filter((space) => space.tile !== undefined && space.tile.tileType === TileType.CITY && space.spaceType !== SpaceType.COLONY).length;
    }
    public getCitiesInPlay(): number {
        return this.spaces.filter((space) => space.tile !== undefined && space.tile.tileType === TileType.CITY).length;
    } 
    public getSpaceCount(tileType: TileType, player: Player): number {
        return this.spaces.filter((space) => space.tile !== undefined && space.tile.tileType === tileType && space.player !== undefined && space.player === player).length;
    }
    public getSpaces(spaceType: SpaceType): Array<ISpace> {
        return this.spaces.filter((space) => space.spaceType === spaceType);
    }
    public addTile(player: Player, spaceType: SpaceType, space: ISpace, tile: ITile): void {
        if (space.tile !== undefined) {
            throw "Selected space is occupied";
        }
        // Land claim a player can claim land for themselves
        if (space.player !== undefined && space.player !== player) {
            throw "This space is land claimed by " + space.player.name;
        }
        if (space.spaceType !== spaceType) {
            throw "Select a valid location " + space.spaceType + " is not " + spaceType;
        }
        space.player = player;
        space.tile = tile;
        space.bonus.forEach((spaceBonus) => {
            if (spaceBonus === SpaceBonus.DRAW_CARD) {
                player.cardsInHand.push(this.dealer.dealCard());
            } else if (spaceBonus === SpaceBonus.PLANT) {
                player.plants++;
            } else if (spaceBonus === SpaceBonus.STEEL) {
                player.steel++;
            } else if (spaceBonus === SpaceBonus.TITANIUM) {
                player.titanium++;
            }
        });
        this.getAdjacentSpaces(space).forEach((adjacentSpace) => {
            if (adjacentSpace.tile && adjacentSpace.tile.tileType === TileType.OCEAN) {
                player.megaCredits += 2;
            } 
        });
    }

    public getAdjacentSpaces(space: ISpace): Array<ISpace> {
        if (space.spaceType !== SpaceType.COLONY) {
            if (space.y < 0 || space.y > 8) {
                throw "Unexpected space y value";
            }
            if (space.x < 0 || space.x > 8) {
                throw "Unexpected space x value";
            }
            const leftSpace: Array<number> = [space.x - 1, space.y],
                rightSpace: Array<number> = [space.x + 1, space.y],
                topLeftSpace: Array<number> = [space.x, space.y - 1],
                topRightSpace: Array<number> = [space.x, space.y - 1],
                bottomLeftSpace: Array<number> = [space.x, space.y + 1],
                bottomRightSpace: Array<number> = [space.x, space.y + 1];
            if (space.y < 4) {
                bottomLeftSpace[0]--;
                topRightSpace[0]++;
            } else if (space.y === 4) {
                bottomRightSpace[0]++;
                topRightSpace[0]++;
            } else {
                bottomRightSpace[0]++;
                topLeftSpace[0]--;
            }
            return this.spaces.filter((aSpace) => {
                return space !== aSpace && aSpace.spaceType !== SpaceType.COLONY && (
                    (aSpace.x === leftSpace[0] && aSpace.y === leftSpace[1]) ||
                    (aSpace.x === rightSpace[0] && aSpace.y === rightSpace[1]) ||
                    (aSpace.x === topLeftSpace[0] && aSpace.y === topLeftSpace[1]) ||
                    (aSpace.x === topRightSpace[0] && aSpace.y === topRightSpace[1]) ||
                    (aSpace.x === bottomLeftSpace[0] && aSpace.y === bottomLeftSpace[1]) ||
                    (aSpace.x === bottomRightSpace[0] && aSpace.y === bottomRightSpace[1]));
            });
        }
        return [];
    }
    private tilePlaced(space: ISpace) {
        this.players.forEach((player) => {
            if (player.corporationCard !== undefined && player.corporationCard.onTilePlaced !== undefined) {
                player.corporationCard.onTilePlaced(player, space);
            }
            player.playedCards.forEach((playedCard) => {
                if (playedCard.onTilePlaced !== undefined) {
                    playedCard.onTilePlaced(player, space);
                }
            });
        });
    }
    public addGreenery(player: Player, spaceId: string, spaceType: SpaceType = SpaceType.LAND): SelectSpace | undefined {
        this.addTile(player, spaceType, this.getSpace(spaceId), { tileType: TileType.GREENERY });
        this.tilePlaced(this.getSpace(spaceId));
        return this.increaseOxygenLevel(player, 1);
    }
    public addCityTile(player: Player, spaceId: string, spaceType: SpaceType = SpaceType.LAND, cardName: string | undefined = undefined): void {
        const space = this.getSpace(spaceId);
        this.addTile(player, spaceType, space, { tileType: TileType.CITY, card: cardName });
        this.tilePlaced(space);
    }
    public addOceanTile(player: Player, spaceId: string, spaceType: SpaceType = SpaceType.OCEAN): void {
        if (this.getOceansOnBoard() - 1 === constants.MAX_OCEAN_TILES) {
            return;
        }
        this.addTile(player, spaceType, this.getSpace(spaceId), { tileType: TileType.OCEAN });
        player.terraformRating++;
        this.tilePlaced(this.getSpace(spaceId));
    }
    public getOceansOnBoard(): number {
        return this.getSpaces(SpaceType.OCEAN).filter((space) => space.tile !== undefined && space.tile.tileType === TileType.OCEAN).length + this.getSpaces(SpaceType.LAND).filter((space) => space.tile !== undefined && space.tile.tileType === TileType.OCEAN).length;
    }
    public getPlayers(): Array<Player> {
        return this.players;
    }

    public getOtherAnimalCards(c: IProjectCard): Array<IProjectCard> {
        const result: Array<IProjectCard> = [];
        this.players.forEach((player) => {
            player.playedCards.forEach((card) => {
                if (card.name !== c.name && card.resourceType === ResourceType.ANIMAL) {
                    result.push(card);
                }
            });
        });
        return result;
    }

    public getOtherMicrobeCards(c: IProjectCard): Array<IProjectCard> {
        const result: Array<IProjectCard> = [];
        this.players.forEach((player) => {
            player.playedCards.forEach((card) => {
                if (card.name !== c.name && card.resourceType === ResourceType.MICROBE) {
                    result.push(card);
                }
            });
        });
        return result;
    }

    public getPlayedCardsWithAnimals(): Array<IProjectCard> {
        const result: Array<IProjectCard> = [];
        this.players.forEach((player) => {
            player.playedCards.forEach((card) => {
                if (card.resourceType === ResourceType.ANIMAL) {
                    result.push(card);
                }
            });
        });
        return result;
    }
    public getCardPlayer(name: string): Player {
        for (let i = 0; i < this.players.length; i++) {
            for (let j = 0; j < this.players[i].playedCards.length; j++) {
                if (this.players[i].playedCards[j].name === name) {
                    return this.players[i];
                }
            }
        }
        throw "No player has played requested card";
    }
    public getCard(name: string): IProjectCard | undefined {
        for (let i = 0; i < this.players.length; i++) {
            for (let j = 0; j < this.players[i].playedCards.length; j++) {
                if (this.players[i].playedCards[j].name === name) {
                    return this.players[i].playedCards[j];
                }
            }
        }
        return undefined;
    }
    private setupSolo() {
        this.players[0].terraformRating = this.players[0].terraformRatingAtGenerationStart = 14;
        // Single player add neutral player and put 2 neutrals cities on board with adjacent forest
        let neutral = new Player("neutral", Color.NEUTRAL, true);
        let space1 = this.originalBoard.getRandomCitySpace();
        this.addCityTile(neutral, space1.id, SpaceType.LAND);
        const fspace1 = this.originalBoard.getForestSpace(this.getAdjacentSpaces(space1));
        this.addTile(neutral, SpaceType.LAND, fspace1, { tileType: TileType.GREENERY });
        let space2 = this.originalBoard.getRandomCitySpace(30);
        this.addCityTile(neutral, space2.id, SpaceType.LAND);
        const fspace2 = this.originalBoard.getForestSpace(this.getAdjacentSpaces(space2));
        this.addTile(neutral, SpaceType.LAND, fspace2, { tileType: TileType.GREENERY });
        return undefined;
    }
}

