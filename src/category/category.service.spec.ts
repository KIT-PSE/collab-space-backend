import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';

/**
 * Test suite for the CategoryService class.
 */
describe('CategoryService', () => {
  let service: CategoryService;

  /**
   * Setup before each test case by creating a testing module and
   * obtaining an instance of the CategoryService.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  /**
   * Test case to check if the CategoryService instance is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
