import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssetDto) {
    try {
      return await this.prisma.asset.create({
        data: { ticker: dto.ticker, name: dto.name, type: dto.type },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Asset with ticker "${dto.ticker}" already exists`);
      }
      throw e;
    }
  }

  async findAll() {
    return this.prisma.asset.findMany();
  }
}
