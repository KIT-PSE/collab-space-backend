import * as request from 'supertest';
import { Bootstrap } from './bootstrap';

describe('user login', () => {
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

  it('GET /auth/profile should 401 if no user is authenticated', async () => {
    return request(bootstrap.app.getHttpServer())
      .get('/auth/profile')
      .expect(401);
  });

  it('GET /auth/profile should 200 if jwt token is passed as cookie', async () => {
    const response = await request(bootstrap.app.getHttpServer())
      .get('/auth/profile')
      .set('Cookie', [authCookie])
      .expect(200);

    const body = response.body;

    expect(body.user).toBeDefined();
    expect(body.exp).toBeDefined();

    return response;
  });
});
