import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const uniqueSuffix = Date.now();
  const testProviderName = `E2E Test Provider ${uniqueSuffix}`;
  const testAssetTicker = `E2E${uniqueSuffix}`;
  const testAssetName = `E2E Test Asset ${uniqueSuffix}`;

  let providerId: string;
  let assetId: string;
  let transactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data respecting FK constraints
    if (transactionId) {
      await prisma.transaction.delete({ where: { id: transactionId } }).catch(() => {});
    }
    if (assetId) {
      await prisma.asset.delete({ where: { id: assetId } }).catch(() => {});
    }
    if (providerId) {
      await prisma.provider.delete({ where: { id: providerId } }).catch(() => {});
    }
    await app.close();
  });

  it('should create a provider', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/providers')
      .send({ name: testProviderName })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(testProviderName);
    providerId = res.body.id;
  });

  it('should create an asset', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/assets')
      .send({
        ticker: testAssetTicker,
        name: testAssetName,
        type: 'STOCK',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.ticker).toBe(testAssetTicker);
    assetId = res.body.id;
  });

  it('should create a transaction', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/transactions')
      .send({
        assetId,
        type: 'BUY',
        quantity: 10,
        price: 150.5,
        date: '2024-01-15',
        currency: 'USD',
        providerId,
        notes: 'E2E test transaction',
      })
      .expect(201);

    transactionId = res.body.id;
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('BUY');
    expect(Number(res.body.quantity)).toBe(10);
    expect(Number(res.body.price)).toBe(150.5);
    expect(res.body.currency).toBe('USD');
    expect(res.body.notes).toBe('E2E test transaction');
    expect(res.body.asset).toBeDefined();
    expect(res.body.asset.id).toBe(assetId);
    expect(res.body.provider).toBeDefined();
    expect(res.body.provider.id).toBe(providerId);
  });

  it('should list transactions and include the created one', async () => {
    const res = await request(app.getHttpServer()).get('/api/transactions').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find((t: { id: string }) => t.id === transactionId);
    expect(found).toBeDefined();
    expect(found.asset).toBeDefined();
    expect(found.provider).toBeDefined();
  });

  it('should get a transaction by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/transactions/${transactionId}`)
      .expect(200);

    expect(res.body.id).toBe(transactionId);
    expect(res.body.asset.id).toBe(assetId);
    expect(res.body.provider.id).toBe(providerId);
  });

  it('should update the transaction', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/transactions/${transactionId}`)
      .send({
        quantity: 20,
        notes: 'Updated e2e note',
      })
      .expect(200);

    expect(res.body.id).toBe(transactionId);
    expect(Number(res.body.quantity)).toBe(20);
    expect(res.body.notes).toBe('Updated e2e note');
  });

  it('should delete the transaction', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/transactions/${transactionId}`)
      .expect(200);

    expect(res.body).toEqual({ deleted: true });
  });

  it('should return 404 for deleted transaction', async () => {
    await request(app.getHttpServer()).get(`/api/transactions/${transactionId}`).expect(404);

    // Mark as cleaned up so afterAll doesn't try to delete again
    transactionId = null as unknown as string;
  });
});
