import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { INestApplication } from '@nestjs/common';
import mikroOrmConfig from '../src/mikro-orm.config';
import { User } from '../src/user/user.entity';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { UserService } from '../src/user/user.service';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

/**
 * Bootstrap class for setting up the application for testing.
 */
export class Bootstrap {
  public app: INestApplication;
  public module: TestingModule;
  public testUser: User;

  /**
   * Initialize the application.
   */
  public async init(): Promise<INestApplication> {
    jest.setTimeout(30000);
    this.module = await Test.createTestingModule({
      imports: [
        AppModule,
        MikroOrmModule.forRoot({
          ...mikroOrmConfig,
          dbName: 'collab_space_test',
          migrations: {
            ...mikroOrmConfig.migrations,
            silent: true,
            transactional: false,
          },
        }),
      ],
    }).compile();

    this.app = this.module.createNestApplication();
    this.app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

    await this.app.init();
    return this.app;
  }

  /**
   * Set up the database for testing.
   */
  public async setupDB(): Promise<void> {
    const orm = this.module.get<MikroORM>(MikroORM);
    await orm.getSchemaGenerator().dropSchema({ dropMigrationsTable: true });
    await orm.getMigrator().up();
  }

  /**
   * Create a valid auth cookie for a test user.
   */
  public async createValidAuthCookie(): Promise<string> {
    const em = this.module.get<EntityManager>(EntityManager).fork();

    this.testUser = new User(
      'Testing User',
      'test@example.com',
      'Test Org',
      await bcrypt.hash('password', UserService.SALT_OR_ROUNDS),
    );

    await em.persistAndFlush(this.testUser);

    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    const { header } = response;
    return header['set-cookie'];
  }

  /**
   * Close the application.
   */
  public async close(): Promise<void> {
    await this.app.close();
  }
}
