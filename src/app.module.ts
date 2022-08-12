import { RiotVersionService } from './riot-version.service';
import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheInterceptor } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.local.env', '.prod.env'],
      load: [
        () => {
          return {
            nowayId:
              process.env.NOWAY_ID || 'ad0c5ee2-6a41-4ea9-8851-a23aafd9f9ab',
          };
        },
      ],
    }),
    HttpModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    CacheModule.register(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RiotVersionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
