import * as request from 'supertest';
import { Bootstrap } from './bootstrap';
import { CreateCategory } from '../src/category/category.dto';

describe('category creation', () => {
  jest.setTimeout(30000);

  let bootstrap: Bootstrap;
  let authCookie: string;

  beforeAll(async () => {
    bootstrap = new Bootstrap();
    await bootstrap.init();
    await bootstrap.setupDB();
    authCookie = await bootstrap.createValidAuthCookie();
  });

  afterAll(async () => {
    await bootstrap.close();
  });

  it('GET /category should be empty', async () => {
    const response = await request(bootstrap.app.getHttpServer())
      .get('/category')
      .set('Cookie', [authCookie])
      .expect(200);

    expect(response.body).toHaveLength(0);

    return response;
  });

  it('POST /category should create a new category', async () => {
    const data: CreateCategory = {
      name: 'Test Category',
    };

    const response = await request(bootstrap.app.getHttpServer())
      .post('/category')
      .set('Cookie', [authCookie])
      .send(data)
      .expect(201);

    const body = response.body;
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Test Category');
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();

    return response;
  });

  it('GET /category should return the created category', async () => {
    const response = await request(bootstrap.app.getHttpServer())
      .get('/category')
      .set('Cookie', [authCookie])
      .expect(200);

    expect(response.body).toHaveLength(1);

    const category = response.body[0];

    expect(category.name).toBe('Test Category');

    return response;
  });

  it('PUT /category/:id should update the category', async () => {
    const response = await request(bootstrap.app.getHttpServer())
      .put('/category/1')
      .set('Cookie', [authCookie])
      .send({ name: 'Updated Category' })
      .expect(200);

    const body = response.body;
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Updated Category');
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();

    return response;
  });

  it('GET /category should return the updated category', async () => {
    const response = await request(bootstrap.app.getHttpServer())
      .get('/category')
      .set('Cookie', [authCookie])
      .expect(200);

    expect(response.body).toHaveLength(1);

    const category = response.body[0];

    expect(category.name).toBe('Updated Category');

    return response;
  });

  it('DELETE /category/:id should delete the category', async () => {
    return request(bootstrap.app.getHttpServer())
      .delete('/category/1')
      .set('Cookie', [authCookie])
      .expect(204);
  });

  it('GET /category should be empty', async () => {
    const response = await request(bootstrap.app.getHttpServer())
      .get('/category')
      .set('Cookie', [authCookie])
      .expect(200);

    expect(response.body).toHaveLength(0);

    return response;
  });
});
