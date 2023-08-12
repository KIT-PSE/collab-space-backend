import * as request from 'supertest';
import { User } from '../src/user/user.entity';
import { RegisterUser } from '../src/auth/auth.dto';
import { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';
import * as bcrypt from 'bcrypt';
import { Bootstrap } from './bootstrap';

describe('user registration', () => {
  let userRepository: EntityRepository<User>;
  let bootstrap: Bootstrap;

  beforeAll(async () => {
    bootstrap = new Bootstrap();
    await bootstrap.init();
    await bootstrap.setupDB();

    userRepository = bootstrap.module
      .get<EntityManager>(EntityManager)
      .fork()
      .getRepository(User);
  });

  afterAll(async () => {
    await bootstrap.close();
  });

  it('GET /auth/profile should 401 if no user is authenticated', async () => {
    return request(bootstrap.app.getHttpServer())
      .get('/auth/profile')
      .expect(401);
  });

  it('users should be empty', async () => {
    const users = await userRepository.findAll();
    expect(users).toHaveLength(0);
  });

  it('POST /auth/register should create a new user', async () => {
    const data: RegisterUser = {
      organization: 'test',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    };

    const response = await request(bootstrap.app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(201);

    const body = response.body;
    expect(body.token).toBeDefined();
    expect(body.user).toBeDefined();
    expect(body.exp).toBeDefined();

    return response;
  });

  it('users should contain the newly registered user', async () => {
    const users = await userRepository.findAll();
    expect(users).toHaveLength(1);

    const user = users[0];

    expect(user.organization).toBe('test');
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBeDefined();
    expect(await bcrypt.compare('password', user.password)).toBe(true);
  });
});
