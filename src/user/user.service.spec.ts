import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { User } from './user.entity';

/**
 * Test suite for UserService.
 */
describe('UserService', () => {
  let service: UserService;
  let entityManager: EntityManager;

  /**
   * Before each test case, create a testing module and compile it.
   * Obtain an instance of UserService for testing.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: EntityManager,
          useValue: {
            persistAndFlush: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
            find: jest.fn(),
            nativeDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  /**
   * Test case to verify that UserService is defined.
   */
  it('should be defined', () => {
    // Assertion to check if service is defined
    expect(service).toBeDefined();
  });
});
