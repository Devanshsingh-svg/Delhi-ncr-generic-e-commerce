import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrderController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /orders creates an order', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 2 }],
      })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.status).toBe('PENDING');
  });

  it('POST /orders/checkout creates order with stock reservation', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .send({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 2 }],
        darkStoreId: 'ds1',
        paymentMethod: 'upi',
      })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('order');
    expect(res.body.data).toHaveProperty('reservations');
  });

  it('POST /orders/checkout validates prescription', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .send({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 1 }],
        prescriptionId: 'p1',
        darkStoreId: 'ds1',
        paymentMethod: 'upi',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /orders/:id returns order', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/orders/non-existent')
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});
