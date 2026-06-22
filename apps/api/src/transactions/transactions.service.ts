import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });
    if (!asset) {
      throw new BadRequestException('Asset not found');
    }

    return this.prisma.transaction.create({
      data: {
        assetId: dto.assetId,
        type: dto.type,
        quantity: dto.quantity,
        price: dto.price,
        currency: dto.currency,
        date: new Date(dto.date),
        notes: dto.notes,
        providerId: dto.providerId,
      },
      include: { asset: true, provider: true },
    });
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      include: { asset: true, provider: true },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { asset: true, provider: true },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    const data: Record<string, unknown> = { ...dto };
    if (dto.date) {
      data.date = new Date(dto.date);
    }

    return this.prisma.transaction.update({
      where: { id },
      data,
      include: { asset: true, provider: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({ where: { id } });
    return { deleted: true };
  }
}
