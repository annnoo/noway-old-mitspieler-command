export interface BannedChampion {
  pickTurn: number;
  championId: number;
  teamId: number;
  staticData?: any;
}

export interface Observers {
  encryptionKey: string;
}

export interface Perks {
  perkIds: number[];
  perkStyle: number;
  perkSubStyle: number;
}

export type Tier =
  | '00_challenger'
  | '10_grandmaster'
  | '20_master'
  | '30_diamond'
  | '40_platinum'
  | '50_gold'
  | '60_silver'
  | '70_bronze'
  | '90_unranked'
  | '80_iron';

export type TierToTiernameMap = {
  [key in Tier]: string;
};

export const TierToTiername: TierToTiernameMap = {
  '00_challenger': 'Challenger',
  '10_grandmaster': 'Grandmaster',
  '20_master': 'Master',
  '30_diamond': 'Diamant',
  '40_platinum': 'Platin',
  '50_gold': 'Gold',
  '60_silver': 'Silber',
  '70_bronze': 'Bronze',
  '80_iron': 'Eisen',
  '90_unranked': 'unranked',
};

export type Rank = 1 | 2 | 3 | 4;

export const rankingToElo = (ranking: Ranking): number => {
  const baseLp = getBaseEloForTier(ranking.tier, ranking.rank);
  return baseLp + ranking.leaguePoints;
};

export const rankingsToEloString = (rankings: Ranking[]): string => {
  const averageElo = rankingsToAverageElo(rankings);
  const tierForElo = getTierForElo(averageElo);
  const tierName = TierToTiername[tierForElo.tier];

  // This is master,gm,challenger
  if (tierForElo.minLp >= 0) {
    return `${tierName} ${averageElo} LP`;
  }

  // Check for edge cases
  const rank = 4 - Math.floor(Math.abs(tierForElo.minLp - averageElo) / 100);
  const calculatedLp = Math.abs(tierForElo.minLp - averageElo) % 100;

  return `${tierName} ${rank} ${calculatedLp} LP`;
};

export const rankingsToAverageElo = (rankings: Ranking[]): number => {
  const filteredRanks = rankings.filter((i) => i && i.tier != '90_unranked');
  const rankSum = filteredRanks.reduce((prev, current) => {
    return prev + rankingToElo(current);
  }, 0);

  return Math.floor(rankSum / filteredRanks.length);
};

export const getBaseEloForTier = (tier: Tier, rank: Rank = 1): number => {
  // Todo: Save in seperate object/map for better lookup
  switch (tier) {
    case '30_diamond':
      return -(rank * 100);
    case '40_platinum':
      return -400 - rank * 100;
  }
  return 0;
};

// Calculate dynamically via riot api
// See https://developer.riotgames.com/apis#league-v4/GET_getLeagueEntries
export const getTierForElo = (lp: number): TierWithMinLp => {
  if (lp >= 500) return { tier: '00_challenger', minLp: 500 };
  if (lp >= 250) return { tier: '10_grandmaster', minLp: 250 };
  if (lp >= 0) return { tier: '20_master', minLp: 0 };
  if (lp > -400) return { tier: '30_diamond', minLp: -400 };
  if (lp > -800) return { tier: '40_platinum', minLp: -800 };
  // Todo: add rest of ranks
  return { tier: '50_gold', minLp: -1200 };
};

export interface TierWithMinLp {
  tier: Tier;
  minLp: number;
}

export interface Lolpros {
  uuid: string;
  name: string;
  slug: string;
  country: string;
  position: string;
  team?: any;
}

export interface Ranking {
  queueType: string;
  tier: Tier;
  rank: Rank;
  wins: number;
  losses: number;
  leaguePoints: number;
  season: string;
  miniSeries?: any;
  limited: boolean;
}

// Todo: Champions irgendwoher bekommen
export interface Participant {
  championId: number;
  perks: Perks;
  profileIconId: number;
  bot: boolean;
  teamId: number;
  summonerName: string;
  summonerId: string;
  spell1Id: number;
  spell2Id: number;
  gameCustomizationObjects: any[];
  staticData?: any;
  lolpros: Lolpros;
  ranking: Ranking;
}

export interface LolprosLiveGameResponse {
  gameId: number;
  gameType: string;
  gameStartTime: number;
  mapId: number;
  gameLength: number;
  platformId: string;
  gameMode: string;
  bannedChampions: BannedChampion[];
  gameQueueConfigId: number;
  observers: Observers;
  participants: Participant[];
}
