import { RiotVersionService } from './riot-version.service';
import {
  LolprosLiveGameResponse,
  rankingsToEloString,
} from './models/LolprosResponse';
import { ConfigService } from '@nestjs/config';
import {
  CACHE_MANAGER,
  HttpService,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
    private readonly riotService: RiotVersionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
 
  sendLolprosInfo(sendUrl: string, value: string) {
    Logger.log(`Sending ${value} to ${sendUrl}`);
    if (sendUrl) {
      this.http.post(sendUrl, { message: value }).subscribe(
        () => {},
        (err) => {
          Logger.error(
            'Error while sending message to endpoint...' + err,
            this.constructor.name,
          );
        },
      );
    }
  }

  async getLolprosInfo() {
    const uuid = this.configService.get('nowayId');
    const uri = `https://api.lolpros.gg/lol/game/from-player/${uuid}`;
    Logger.log('Getting Data from API', this.constructor.name);
    Logger.log(uuid, this.constructor.name);
    const res = await this.http.get<LolprosLiveGameResponse>(uri).toPromise();

    return await this.getFormattedString(res.data);
  }

  async getFormattedString(data: LolprosLiveGameResponse) {
    if (data && data.participants) {
      const foundPros = data.participants.filter((i) => i.lolpros != null);
      const eloString = rankingsToEloString(
        data.participants.map((i) => i.ranking),
      );

      const championMap = await this.riotService.getLatestChampions();
      const fullString = foundPros
        .map((i) => {
          const champ = championMap.get(i.championId).name;
          const name = i.lolpros.name;
          return `${champ} = ${name}`;
        })
        .join('; ');
      return `Bekannte Spieler: ${fullString}, Durchschnittliche Elo: ${eloString}`;
    }
    return 'Nicht im Game';
  }
}
