import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: { ticker: dto.ticker, name: dto.name, type: dto.type },
    });
  }

  async findAll() {
    return this.prisma.asset.findMany();
  }
}
