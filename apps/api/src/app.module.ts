import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [PrismaModule, ProvidersModule],
})
export class AppModule {}
