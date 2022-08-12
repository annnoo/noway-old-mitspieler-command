import { RiotVersionService } from './riot-version.service';
import {
  CacheKey,
  CacheTTL,
  CACHE_MANAGER,
  Controller,
  Get,
  HttpService,
  Inject,
  Logger,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { Cache } from 'cache-manager';

const LOLPROS_STRING_KEY = 'lolpros-string-cache';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly riotService: RiotVersionService,
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  async getMitspieler(@Req() request: Request, @Res() res: Response) {
    const cacheValue = await this.cacheManager.get(LOLPROS_STRING_KEY);
    Logger.log(`Getting value from cache ${cacheValue}`);
    if (cacheValue) {
      res.send(cacheValue);
      return;
    }

    const resUrl = request.header('Nightbot-Response-Url');
    let slowRequest = false;

    const lolprosStringPromise = this.appService
      .getLolprosInfo()
      .then(async (value: string) => {
        await this.cacheManager.set(LOLPROS_STRING_KEY, value, { ttl: 240 });
        if (slowRequest) {
          try {
            this.appService.sendLolprosInfo(resUrl, value);
          } catch (e) {
            Logger.error(
              'Error while sending Message... ' + e,
              this.constructor.name,
            );
          }
        }
        Logger.log('Return Value is: ' + value);
        return value;
      });

    const timeoutPromise = new Promise((resolve, reject) => {
      return setTimeout(resolve, 8500);
    }).then(() => {
      slowRequest = true;
      return 'Einen Moment....';
    });

    Promise.race([lolprosStringPromise, timeoutPromise]).then((val: string) => {
      try {
        res.send(val);
      } catch (e) {
        Logger.error(
          'Failed while sending message to Nightbot...',
          this.constructor.name,
        );
      }
    });
  }
}
