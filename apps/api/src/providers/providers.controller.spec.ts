import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProvidersModule } from './providers.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

describe('ProvidersController', () => {
  let app: INestApplication;

  const mockPrismaService = {
    provider: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ProvidersModule],
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

  describe('POST /providers', () => {
    it('should create a provider and return 201', async () => {
      const provider = { id: 'clxyz123', name: 'Fidelity', createdAt: new Date().toISOString() };
      mockPrismaService.provider.create.mockResolvedValue(provider);

      const response = await request(app.getHttpServer())
        .post('/providers')
        .send({ name: 'Fidelity' })
        .expect(201);

      expect(response.body).toEqual(provider);
      expect(mockPrismaService.provider.create).toHaveBeenCalledWith({
        data: { name: 'Fidelity' },
      });
    });

    it('should return 409 when provider name is duplicate', async () => {
      const { Prisma } = jest.requireActual('@prisma/client');
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });
      mockPrismaService.provider.create.mockRejectedValue(error);

      await request(app.getHttpServer()).post('/providers').send({ name: 'Fidelity' }).expect(409);
    });
  });

  describe('GET /providers', () => {
    it('should return an array of providers', async () => {
      const providers = [
        { id: 'clxyz123', name: 'Fidelity', createdAt: new Date().toISOString() },
        { id: 'clxyz456', name: 'Schwab', createdAt: new Date().toISOString() },
      ];
      mockPrismaService.provider.findMany.mockResolvedValue(providers);

      const response = await request(app.getHttpServer()).get('/providers').expect(200);

      expect(response.body).toEqual(providers);
      expect(mockPrismaService.provider.findMany).toHaveBeenCalled();
    });
  });
});
