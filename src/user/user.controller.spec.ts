import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { isGuarded } from '../../test/utils';
import { AdminGuard } from '../common/guards/admin.guard';

/**
 * Test suite to verify the behavior of the UserController.
 */
describe('UserController', () => {
  let controller: UserController;

  /**
   * Before each test case, create a testing module with UserController.
   * Compile the module and obtain an instance of UserController.
   * This ensures a fresh instance is available for each test case.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            changeRole: jest.fn(),
            changeUserData: jest.fn(),
            delete: jest.fn(),
            changePassword: jest.fn(),
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

    controller = module.get<UserController>(UserController);
  });

  /**
   * Test case: Ensure that UserController is defined.
   * This test validates that the controller instance was created successfully.
   */
  it('should be defined', () => {
    // Assertion to check if controller is defined
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.findAll, AuthGuard)).toBe(true);
    });

    it('should be protected with AdminGuard', () => {
      expect(isGuarded(controller.findAll, AdminGuard)).toBe(true);
    });
  });

  describe('changeRole', () => {
    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.changeRole, AuthGuard)).toBe(true);
    });

    it('should be protected with AdminGuard', () => {
      expect(isGuarded(controller.changeRole, AdminGuard)).toBe(true);
    });
  });

  describe('changeUserData', () => {
    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.changeUserData, AuthGuard)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.delete, AuthGuard)).toBe(true);
    });

    it('should be protected with AdminGuard', () => {
      expect(isGuarded(controller.delete, AdminGuard)).toBe(true);
    });
  });
});
