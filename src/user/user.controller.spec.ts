import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';

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
    }).compile();

    // Obtain an instance of UserController from the module
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
});
