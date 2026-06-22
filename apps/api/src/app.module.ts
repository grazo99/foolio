import { Module } from '@nestjs/common';
import { AssetsModule } from './assets/assets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProvidersModule } from './providers/providers.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [PrismaModule, ProvidersModule, AssetsModule, TransactionsModule],
})
export class AppModule {}
