import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AssetsModule } from './assets.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

describe('AssetsController', () => {
  let app: INestApplication;

  const mockPrismaService = {
    asset: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AssetsModule],
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

  describe('POST /assets', () => {
    it('should create an asset and return 201', async () => {
      const asset = {
        id: 'clxyz123',
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: 'STOCK',
        createdAt: new Date().toISOString(),
      };
      mockPrismaService.asset.create.mockResolvedValue(asset);

      const response = await request(app.getHttpServer())
        .post('/assets')
        .send({ ticker: 'AAPL', name: 'Apple Inc.', type: 'STOCK' })
        .expect(201);

      expect(response.body).toEqual(asset);
      expect(mockPrismaService.asset.create).toHaveBeenCalledWith({
        data: { ticker: 'AAPL', name: 'Apple Inc.', type: 'STOCK' },
      });
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer()).post('/assets').send({ ticker: 'AAPL' }).expect(400);
    });

    it('should return 400 when type is invalid', async () => {
      await request(app.getHttpServer())
        .post('/assets')
        .send({ ticker: 'AAPL', name: 'Apple Inc.', type: 'INVALID' })
        .expect(400);
    });

    it('should return 409 when ticker already exists', async () => {
      const { Prisma } = jest.requireActual('@prisma/client');
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });
      mockPrismaService.asset.create.mockRejectedValue(error);

      await request(app.getHttpServer())
        .post('/assets')
        .send({ ticker: 'AAPL', name: 'Apple Inc.', type: 'STOCK' })
        .expect(409);
    });
  });

  describe('GET /assets', () => {
    it('should return an array of assets', async () => {
      const assets = [
        {
          id: 'clxyz123',
          ticker: 'AAPL',
          name: 'Apple Inc.',
          type: 'STOCK',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'clxyz456',
          ticker: 'BTC',
          name: 'Bitcoin',
          type: 'CRYPTO',
          createdAt: new Date().toISOString(),
        },
      ];
      mockPrismaService.asset.findMany.mockResolvedValue(assets);

      const response = await request(app.getHttpServer()).get('/assets').expect(200);

      expect(response.body).toEqual(assets);
      expect(mockPrismaService.asset.findMany).toHaveBeenCalled();
    });
  });
});
