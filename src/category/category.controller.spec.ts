import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { JwtService } from '@nestjs/jwt';
import { CategoryService } from './category.service';
import { AuthService } from '../auth/auth.service';
import { isGuarded } from '../../test/utils';
import { AuthGuard } from '../auth/auth.guard';

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            allFromUser: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            user: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  /**
   * Test case to ensure that the CategoryController is defined.
   * It checks whether the controller instance is created successfully.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be protected by AuthGuard', () => {
    expect(isGuarded(CategoryController, AuthGuard)).toBe(true);
  });
});
