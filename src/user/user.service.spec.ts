import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

/**
 * Test suite for UserService.
 */
describe('UserService', () => {
  let service: UserService;

  /**
   * Before each test case, create a testing module and compile it.
   * Obtain an instance of UserService for testing.
   */
  beforeEach(async () => {
    // Create a testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    // Obtain an instance of UserService from the module
    service = module.get<UserService>(UserService);
  });

  /**
   * Test case to verify that UserService is defined.
   */
  it('should be defined', () => {
    // Assertion to check if service is defined
    expect(service).toBeDefined();
  });
});
