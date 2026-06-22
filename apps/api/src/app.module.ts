import { Module } from '@nestjs/common';
import { AssetsModule } from './assets/assets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [PrismaModule, ProvidersModule, AssetsModule],
})
export class AppModule {}
