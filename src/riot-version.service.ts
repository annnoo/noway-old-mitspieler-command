import {
  CacheKey,
  CacheTTL,
  CACHE_MANAGER,
  HttpService,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  RiotChampionData,
  RiotChampionDataMap,
} from './models/RiotChampionModel';

const NEXT_CACHE_TIMESTAMP_NAME = 'NEXT_LATEST_CHAMP_TIMESTAMP';
const CHAMP_MAP_CACHE = 'CHAMP_MAP';
const CACHE_TTL = 3600 * 1000;
@Injectable()
export class RiotVersionService {
  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @CacheKey('riot_champions')
  @CacheTTL(3600)
  async getLatestChampions() {
    const nextCache = (await this.cacheManager.get(
      NEXT_CACHE_TIMESTAMP_NAME,
    )) as number;

    Logger.log('Next cache value is ' + nextCache, this.constructor.name);

    if (nextCache > new Date().getTime()) {
      const map: Map<number, RiotChampionData> = await this.cacheManager.get(
        CHAMP_MAP_CACHE,
      );
      Logger.log('Getting Map from cache', this.constructor.name);

      if (map) {
        Logger.log('return Map from cache', this.constructor.name);

        return map;
      }
    }

    const version = await this.getLatestVersion();
    const uri = `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;

    const map = await this.http
      .get(uri)
      .toPromise()
      .then((response) => {
        const keyToDataMap = new Map<number, RiotChampionData>();
        const dataMap = response.data.data as RiotChampionDataMap;
        Object.values(dataMap).forEach((item) =>
          keyToDataMap.set(+item.key, item),
        );
        Logger.log('getting data from API', this.constructor.name);

        return keyToDataMap;
      });
    this.cacheManager.set(
      NEXT_CACHE_TIMESTAMP_NAME,
      new Date().getTime() + CACHE_TTL,
    );
    this.cacheManager.set(CHAMP_MAP_CACHE, map);
    return map;
  }

  @CacheKey('riot_version')
  @CacheTTL(3600)
  getLatestVersion() {
    return this.http
      .get('https://ddragon.leagueoflegends.com/api/versions.json')
      .toPromise()
      .then((data) => {
        return data.data[0];
      });
  }
}
