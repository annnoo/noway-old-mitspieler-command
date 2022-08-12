import {
  LolprosLiveGameResponse,
  rankingsToAverageElo,
  Tier,
} from './LolprosResponse';

export interface LolProPlayer {
  uuid: string;
  name: string;
  slug: string;
  country: string;
  position: string;
}

export interface LolAccount {
  summonerName: string;
  summonerId: string;
  lolpro: LolProPlayer;
}

export interface Game {
  accounts: LolAccount[];
  originalData: LolprosLiveGameResponse;
}

export function buildFromLolprosResponse(res: LolprosLiveGameResponse) {
  const summoners = res.participants.map((i) => ({
    summonerId: i.summonerId,
    summonerName: i.summonerName,
    lolProUuid: i.lolpros.uuid,
  }));

  const lolpros = res.participants.map((i) => i.lolpros);

  const averageElo = rankingsToAverageElo(
    res.participants.map((i) => i.ranking),
  );

  const game = {
    id: res.gameId,
    type: res.gameType,
    startTime: res.gameStartTime,
    averageElo: averageElo,
  };

  const ingameSummoner = res.participants.map((i) => ({
    summonerId: i.summonerId,
    summonerName: i.summonerName,
    team: i.teamId,
    championId: i.championId,
    summoners: [i.spell1Id, i.spell2Id],
    currentRanking: i.ranking,
  }));
}
