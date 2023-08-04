import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

/**
 * Test suite for the AuthController class.
 */
describe('AuthController', () => {
  let controller: AuthController;

  /**
   * Executes before each individual test case.
   * Creates a TestingModule containing the AuthController.
   * Retrieves an instance of AuthController from the module.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  /**
   * Single test case: Verifies if the AuthController is defined.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
