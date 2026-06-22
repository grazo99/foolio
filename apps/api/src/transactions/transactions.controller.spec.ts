import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TransactionsModule } from './transactions.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionsController', () => {
  let app: INestApplication;

  const mockPrismaService = {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    asset: {
      findUnique: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, TransactionsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAsset = {
    id: 'asset-1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    type: 'STOCK',
    createdAt: new Date().toISOString(),
  };

  const mockProvider = {
    id: 'provider-1',
    name: 'Fidelity',
    createdAt: new Date().toISOString(),
  };

  const mockTransaction = {
    id: 'tx-1',
    assetId: 'asset-1',
    type: 'BUY',
    quantity: 10,
    price: 150.5,
    currency: 'USD',
    date: '2024-01-15T00:00:00.000Z',
    notes: 'First purchase',
    providerId: 'provider-1',
    createdAt: new Date().toISOString(),
    asset: mockAsset,
    provider: mockProvider,
  };

  describe('POST /transactions', () => {
    it('should create a transaction and return 201', async () => {
      mockPrismaService.asset.findUnique.mockResolvedValue(mockAsset);
      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          assetId: 'asset-1',
          type: 'BUY',
          quantity: 10,
          price: 150.5,
          currency: 'USD',
          date: '2024-01-15',
          notes: 'First purchase',
          providerId: 'provider-1',
        })
        .expect(201);

      expect(response.body).toEqual(mockTransaction);
      expect(mockPrismaService.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'asset-1' },
      });
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          assetId: 'asset-1',
          type: 'BUY',
          quantity: 10,
          price: 150.5,
          currency: 'USD',
          date: new Date('2024-01-15'),
          notes: 'First purchase',
          providerId: 'provider-1',
        },
        include: { asset: true, provider: true },
      });
    });

    it('should return 400 when assetId does not exist', async () => {
      mockPrismaService.asset.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          assetId: 'nonexistent',
          type: 'BUY',
          quantity: 10,
          price: 150.5,
          currency: 'USD',
          date: '2024-01-15',
        })
        .expect(400);
    });

    it('should return 400 when providerId does not exist', async () => {
      mockPrismaService.asset.findUnique.mockResolvedValue(mockAsset);
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          assetId: 'asset-1',
          type: 'BUY',
          quantity: 10,
          price: 150.5,
          currency: 'USD',
          date: '2024-01-15',
          providerId: 'nonexistent',
        })
        .expect(400);
    });

    it('should return 400 when date is not a valid ISO date', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          assetId: 'asset-1',
          type: 'BUY',
          quantity: 10,
          price: 150.5,
          currency: 'USD',
          date: 'not-a-date',
        })
        .expect(400);
    });

    it('should return 400 when quantity is negative', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          assetId: 'asset-1',
          type: 'BUY',
          quantity: -5,
          price: 150.5,
          currency: 'USD',
          date: '2024-01-15',
        })
        .expect(400);
    });

    it('should return 400 when price is zero', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          assetId: 'asset-1',
          type: 'BUY',
          quantity: 10,
          price: 0,
          currency: 'USD',
          date: '2024-01-15',
        })
        .expect(400);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ assetId: 'asset-1' })
        .expect(400);
    });
  });

  describe('GET /transactions', () => {
    it('should return an array of transactions with nested asset and provider', async () => {
      const transactions = [mockTransaction];
      mockPrismaService.transaction.findMany.mockResolvedValue(transactions);

      const response = await request(app.getHttpServer()).get('/transactions').expect(200);

      expect(response.body).toEqual(transactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        include: { asset: true, provider: true },
      });
    });
  });

  describe('GET /transactions/:id', () => {
    it('should return a single transaction', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      const response = await request(app.getHttpServer()).get('/transactions/tx-1').expect(200);

      expect(response.body).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        include: { asset: true, provider: true },
      });
    });

    it('should return 404 when transaction not found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer()).get('/transactions/nonexistent').expect(404);
    });
  });

  describe('PATCH /transactions/:id', () => {
    it('should update a transaction', async () => {
      const updated = { ...mockTransaction, quantity: 20 };
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/transactions/tx-1')
        .send({ quantity: 20 })
        .expect(200);

      expect(response.body).toEqual(updated);
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: { quantity: 20 },
        include: { asset: true, provider: true },
      });
    });

    it('should return 400 when updating with non-existent assetId', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.asset.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/transactions/tx-1')
        .send({ assetId: 'nonexistent' })
        .expect(400);
    });

    it('should return 404 when updating non-existent transaction', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/transactions/nonexistent')
        .send({ quantity: 20 })
        .expect(404);
    });
  });

  describe('DELETE /transactions/:id', () => {
    it('should delete a transaction and return { deleted: true }', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.delete.mockResolvedValue(mockTransaction);

      const response = await request(app.getHttpServer()).delete('/transactions/tx-1').expect(200);

      expect(response.body).toEqual({ deleted: true });
      expect(mockPrismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
    });

    it('should return 404 when deleting non-existent transaction', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer()).delete('/transactions/nonexistent').expect(404);
    });
  });
});
