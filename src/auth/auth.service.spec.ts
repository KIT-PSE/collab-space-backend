import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

/**
 * Test suite for the AuthService class.
 */
describe('AuthService', () => {
  let service: AuthService;

  /**
   * Executes before each individual test case.
   * Creates a TestingModule containing the AuthService.
   * Retrieves an instance of AuthService from the module.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  /**
   * Single test case: Verifies if the AuthService is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
